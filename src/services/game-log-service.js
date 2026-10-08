import {AsyncLocalStorage} from 'node:async_hooks';
import {Op} from 'sequelize';
import sequelize,{currentTransaction} from '../db/config.js';
import {User,Family} from '../db/models.js';
import {GameLog,GameLogUser} from './game-log-model.js';
import {classifyLog,logTypes,resourceNames,currencyNames} from './game-log-types.js';

const storage=new AsyncLocalStorage(),watched=new Set(Object.keys(resourceNames));
const hidden=new Set(['password','token','payload','chargeId','createdAt','updatedAt']);
const autoUser=new Set(['firstname','username']);
const pending=Symbol('logChanges'),snapshot=Symbol('logSnapshot');
const rootTransaction=transaction=>{while(transaction?.parent)transaction=transaction.parent;return transaction;};
let installed=false;
export const currentLogContext=()=>storage.getStore();
const safe=v=>v instanceof Date?v.toISOString():v===undefined?null:typeof v==='bigint'?String(v):v;
function values(model,row,source){return Object.fromEntries(Object.entries(row||{}).filter(([k])=>!hidden.has(k)&&!(source==='bot'&&model==='user'&&autoUser.has(k))).map(([k,v])=>[k,safe(v)]));}
export function diffValues(model,before,after,source='bot'){
  const a=values(model,before,source),b=values(model,after,source),keys=new Set([...Object.keys(a),...Object.keys(b)]);
  const changed=[...keys].filter(k=>{const x=a[k]??null,y=b[k]??null;if(JSON.stringify(x)===JSON.stringify(y))return false;return !(x!==null&&y!==null&&['number','string'].includes(typeof x)&&['number','string'].includes(typeof y)&&String(x)===String(y));});
  return {before:Object.fromEntries(changed.map(k=>[k,a[k]??null])),after:Object.fromEntries(changed.map(k=>[k,b[k]??null]))};
}
function change(model,operation,before,after,scope){
  const onlyFields=row=>row&&Object.fromEntries(Object.entries(row).filter(([key])=>Object.hasOwn(model.rawAttributes,key)));
  before=onlyFields(before);after=onlyFields(after);
  const diff=operation==='update'?diffValues(model.name,before,after,scope.source):{before:before?values(model.name,before,scope.source):null,after:after?values(model.name,after,scope.source):null};
  if(operation==='update'&&!Object.keys(diff.after).length)return null;
  const row=after||before,entityId=row[model.primaryKeyAttribute];
  return {model:model.name,entityId:String(entityId??''),label:row.itemName??row.name??null,operation,...diff,ownerId:model.name==='user'?row.id:['famMember','add'].includes(model.name)?null:row.userId??row.roleId??null,ownerTelegramId:model.name==='user'?row.chatId:['famMember','add'].includes(model.name)?row.userId:model.name==='family'?row.owner:null,previousOwnerId:before?.userId??before?.roleId??null,previousOwnerTelegramId:['famMember','add'].includes(model.name)?before?.userId:null};
}
async function append(scope,entry,options={}){
  if(!entry)return;
  const record=async()=>{
    if(scope.closed){await persist({...scope,changes:[entry],notes:[],closed:true});return;}
    if(scope.changes.length<100)scope.changes.push(entry);else scope.omitted++;
  };
  const transaction=rootTransaction(options.transaction);
  if(transaction&&!transaction.finished){transaction.afterCommit(async()=>{if(options.transaction?.finished!=='rollback')await record();});}else if(transaction?.finished==='rollback')return;else await record();
}
// Logs are written separately after commit. Failure of the journal must not roll back a game operation.
async function persist(scope){
  if(!scope.changes.length&&!scope.notes.length&&!scope.error)return;
  try{
    const ids=new Set(),telegramIds=new Set();
    if(scope.actorId)ids.add(scope.actorId);if(scope.actorTelegramId)telegramIds.add(String(scope.actorTelegramId));
    for(const c of scope.changes){for(const id of [c.ownerId,!['famMember','add'].includes(c.model)&&c.previousOwnerId])if(id)ids.add(Number(id));for(const id of [c.ownerTelegramId,c.previousOwnerTelegramId])if(id)telegramIds.add(String(id));}
    for(const n of scope.notes)for(const u of n.users||[]){if(u.id)ids.add(Number(u.id));if(u.chatId)telegramIds.add(String(u.chatId));}
    const participants=(ids.size||telegramIds.size)?await User.findAll({where:{[Op.or]:[{id:{[Op.in]:[...ids]}},{chatId:{[Op.in]:[...telegramIds]}}]},attributes:['id','chatId','firstname','username'],transaction:null}):[];
    const type=scope.type||(scope.error?'error':classifyLog(scope.command,scope.changes,scope.notes));
    const currencies=new Set();for(const c of scope.changes)for(const key of new Set([...Object.keys(c.before||{}),...Object.keys(c.after||{})])){if(c.model==='family'&&key==='balance')currencies.add('famMoney');else if(c.model==='family'&&key==='mef')currencies.add('balance');else if(c.model==='card'&&key==='balance')currencies.add('coin');else if(c.model==='card'&&key==='fuel')currencies.add('freeze');else if(c.model==='chat'&&key==='bank')currencies.add('balance');else if(['user','mining'].includes(c.model)&&Object.hasOwn(currencyNames,key))currencies.add(key);}
    const details={command:scope.command,currencies:[...currencies],changes:scope.changes,notes:scope.notes.map(({users,...n})=>n),omitted:scope.omitted||0,...(scope.error?{error:scope.error}:{}),...(scope.extra?{context:scope.extra}:{})};
    await sequelize.transaction(async transaction=>{
      const actorId=scope.actorId||participants.find(u=>String(u.chatId)===scope.actorTelegramId)?.id;
      const description=scope.notes.find(n=>n.operation)?.operation||logTypes[type]||type;
      const log=await GameLog.create({type,status:scope.error?'error':scope.status||'success',source:scope.source,actorId,actorTelegramId:scope.actorTelegramId,chatId:scope.chatId,global:scope.changes.some(c=>c.global),action:(description+(scope.command?' · '+scope.command:'')).slice(0,255),details},{transaction,hooks:false});
      const rows=participants.map(u=>({logId:log.id,userId:u.id,telegramId:String(u.chatId),name:String(u.firstname||'').slice(0,120),username:String(u.username||'').slice(0,64)}));
      for(const id of telegramIds)if(!rows.some(r=>r.telegramId===id))rows.push({logId:log.id,telegramId:id});
      if(rows.length)await GameLogUser.bulkCreate(rows,{transaction,hooks:false});
    });
  }catch(error){console.error('Game journal write failed:',error.name,error.original?.code||error.code||'');}
}
export async function withLogContext(meta,operation){
  if(currentLogContext())return operation();
  const scope={source:'bot',command:'',changes:[],notes:[],omitted:0,...meta};
  return storage.run(scope,async()=>{
    try{return await operation();}catch(error){scope.error=String(error.code||error.name||'Error').slice(0,100);throw error;}
    finally{scope.closed=true;await persist(scope);}
  });
}
export async function noteLog(type,details={},users=[]){
  const scope=currentLogContext(),transaction=rootTransaction(currentTransaction());
  const add=async()=>{if(scope){const note={type,...details,users:users.map(u=>({id:u?.id,chatId:u?.chatId}))};if(scope.closed)await persist({...scope,changes:[],notes:[note]});else if(scope.notes.length<100)scope.notes.push(note);else scope.omitted++;}else await withLogContext({type:type||'reward',source:'system'},async()=>{currentLogContext().notes.push({...details,users});});};
  if(transaction&&!transaction.finished)transaction.afterCommit(add);else await add();
}
export async function gameLogMiddleware(ctx,next){
  const scene=ctx.session?.__scenes?.current,text=ctx.callbackQuery?.data||ctx.message?.text||ctx.channelPost?.text||'',first=text.trim().split(/\s+/)[0]||'';
  const command=scene?'Сцена '+scene:/^(\/start|t_|eyJ)/i.test(first)?first.split('_')[0]:text.trim().split(/\s+/).slice(0,2).join(' ').slice(0,80);
  // Never store arbitrary conversations, tokens, or scene answers as command text.
  const known=/^(передать|дать|купить|продать|открыть|кейс|крафт|скрафт|надеть|снять|удалить|оплатить|улучшить|семья|создать|ферма|фарм|собрать|выдать|админка|основатель|дом|карта|видеокарта|смазать|заправить|крипта|слоты|слот|бонус|актив|рулетка|бандит|кости|казино|рп|рб|раздача|мут|варн|пред|бан|размут|разварн|разбан|говори|-ферма|\/start|\d{6}$)/i.test(first);
  return withLogContext({command:scene?command:known?command:ctx.callbackQuery?'Кнопка':'Игровое действие',actorTelegramId:ctx.from?String(ctx.from.id):null,chatId:ctx.chat?String(ctx.chat.id):null,extra:{updateId:ctx.update?.update_id}},async()=>{try{await next();}finally{const scope=currentLogContext();scope.actorId=ctx.state?.user?.id||scope.actorId;}});
}
export function installGameLogHooks(){
  if(installed)return;installed=true;
  const eligible=model=>currentLogContext()&&watched.has(model?.name)&&(model.name!=='active'||currentLogContext().source==='admin');
  const protect=fn=>async(...args)=>{try{return await fn(...args);}catch(e){console.error('Game journal capture failed:',e.name);}};
  sequelize.addHook('beforeSave','gameJournal',protect((row,options)=>{
    if(!eligible(row.constructor))return;const scope=currentLogContext(),model=row.constructor;
    const after=row.get({plain:true}),before=row.isNewRecord?null:{...row._previousDataValues};
    options[pending]={scope,model,operation:row.isNewRecord?'create':'update',before,after};
  }));
  sequelize.addHook('afterSave','gameJournal',protect(async(row,options)=>{const p=options[pending];if(p)await append(p.scope,change(p.model,p.operation,p.before,row.get({plain:true}),p.scope),options);}));
  sequelize.addHook('beforeDestroy','gameJournal',protect((row,options)=>{if(eligible(row.constructor))options[pending]={scope:currentLogContext(),entry:change(row.constructor,'delete',row.get({plain:true}),null,currentLogContext())};}));
  sequelize.addHook('afterDestroy','gameJournal',protect(async(row,options)=>{const p=options[pending];if(p)await append(p.scope,p.entry,options);}));
  const beforeBulk=operation=>protect(async options=>{
    const model=options.model;if(!eligible(model)||options.individualHooks)return;
    const scope=currentLogContext(),fields=Object.keys(options.attributes||{}).filter(k=>!hidden.has(k)&&!(scope.source==='bot'&&model.name==='user'&&autoUser.has(k)));
    if(operation==='update'&&!fields.length)return;
    const rows=await model.findAll({where:options.where,transaction:options.transaction,attributes:Object.keys(model.rawAttributes).filter(k=>!hidden.has(k)),limit:101,raw:true});
    options[snapshot]={scope,model,operation,rows,total:rows.length>100?await model.count({where:options.where,transaction:options.transaction}):rows.length};
  });
  const afterBulk=protect(async options=>{
    const p=options[snapshot];if(!p||!p.rows.length)return;
    if(p.rows.length>100){await append(p.scope,{model:p.model.name,operation:p.operation,entityId:'many',global:Reflect.ownKeys(options.where||{}).length===0,before:null,after:values(p.model.name,options.attributes,p.scope.source),summary:'Массовая операция: '+p.total+' записей; подробности ограничены'},options);if(!options.transaction)p.scope.omitted+=Math.max(0,p.total-100);else rootTransaction(options.transaction).afterCommit(()=>{p.scope.omitted+=Math.max(0,p.total-100);});}
    const rows=p.rows.slice(0,100),pk=p.model.primaryKeyAttribute;
    const after=p.operation==='delete'?[]:await p.model.findAll({where:{[pk]:{[Op.in]:rows.map(r=>r[pk])}},attributes:Object.keys(p.model.rawAttributes).filter(k=>!hidden.has(k)),transaction:options.transaction,raw:true});
    for(const row of rows)await append(p.scope,change(p.model,p.operation,row,after.find(a=>String(a[pk])===String(row[pk]))||null,p.scope),options);
  });
  sequelize.addHook('beforeBulkUpdate','gameJournal',beforeBulk('update'));sequelize.addHook('afterBulkUpdate','gameJournal',afterBulk);
  sequelize.addHook('beforeBulkDestroy','gameJournal',beforeBulk('delete'));sequelize.addHook('afterBulkDestroy','gameJournal',afterBulk);
  // Sequelize increment bypasses save/update hooks; family reputation and rewards use it.
  const increment=Family.increment;
  Family.increment=async function(fields,options={}){
    if(!eligible(this))return increment.call(this,fields,options);
    const capture={...options,model:this,attributes:typeof fields==='object'?fields:{}};
    await beforeBulk('update')(capture);
    const result=await increment.call(this,fields,options);
    await afterBulk(capture);return result;
  };
  sequelize.addHook('beforeUpsert','gameJournal',protect(async(row,options)=>{
    if(!eligible(options.model))return;const model=options.model,pk=model.primaryKeyAttribute;
    const before=await model.findByPk(row[pk],{transaction:options.transaction,raw:true});options[pending]={scope:currentLogContext(),model,before};
  }));
  sequelize.addHook('afterUpsert','gameJournal',protect(async(result,options)=>{const p=options[pending];if(p){const row=result[0]?.get?result[0].get({plain:true}):null;if(row)await append(p.scope,change(p.model,p.before?'update':'create',p.before,row,p.scope),options);}}));
}
