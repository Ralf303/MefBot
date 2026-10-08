import {Op,literal} from 'sequelize';
import sequelize from '../db/config.js';
import {User,Logs} from '../db/models.js';
import {GameLog,GameLogUser} from '../services/game-log-model.js';
import {logTypes,resourceNames,currencyNames} from '../services/game-log-types.js';
import {AdminError} from './schema.js';

export const logOptions={types:logTypes,resources:resourceNames,currencies:currencyNames,sources:{bot:'Бот',system:'Системное событие',admin:'Админка'},statuses:{success:'Выполнено',error:'Ошибка',observed:'Команда замечена'}};
const clean=v=>String(v||'').trim().slice(0,100),plain=r=>r.get({plain:true});
function option(value,values,label){if(value&&!Object.hasOwn(values,value))throw new AdminError(400,'Неизвестный '+label);return value;}
export function dateRange(query){
  const range={};
  for(const key of ['from','to'])if(query[key]){
    const input=clean(query[key]);if(!/^\d{4}-\d{2}-\d{2}$/.test(input))throw new AdminError(400,'Неверная дата');
    const parsed=new Date(input+'T00:00:00+03:00');if(!Number.isFinite(parsed.getTime())||new Date(parsed.getTime()+3*3600000).toISOString().slice(0,10)!==input)throw new AdminError(400,'Неверная дата');
    range[key==='from'?Op.gte:Op.lt]=key==='to'?new Date(parsed.getTime()+86400000):parsed;
  }
  if(range[Op.gte]&&range[Op.lt]&&range[Op.gte]>=range[Op.lt])throw new AdminError(400,'Начало периода позже его конца');
  return range;
}
async function identity(query){
  const input=clean(query.user);if(!input)return null;
  const kind=query.userKind||'telegram';if(!['telegram','id','username'].includes(kind))throw new AdminError(400,'Неверный вид ID пользователя');
  if(kind==='id'){if(!/^\d+$/.test(input)||!Number.isSafeInteger(Number(input))||Number(input)<1)throw new AdminError(400,'Неверный ID пользователя');return {userId:Number(input)};}
  if(kind==='telegram'){if(!/^\d{1,20}$/.test(input))throw new AdminError(400,'Неверный Telegram ID');return {telegramId:input};}
  const username=input.replace(/^@/,'');if(!/^[a-zA-Z0-9_]{1,64}$/.test(username))throw new AdminError(400,'Неверный username');
  const user=await User.findOne({where:{username},attributes:['id','chatId']});
  return user?{[Op.or]:[{userId:user.id},{username}]}:{username};
}
export async function listGameLogs(query={}){
  const page=Math.max(1,Math.min(100000,Math.trunc(Number(query.page)||1))),limit=30;
  const where={},conditions=[],range=dateRange(query),q=clean(query.q);
  if(Reflect.ownKeys(range).length)where.createdAt=range;
  const who=await identity(query),archive=query.archive==='true';
  if(archive){
    if(query.type||query.source||query.status||query.resource||query.currency||query.chatId||query.entityId)throw new AdminError(400,'Эти фильтры доступны только для нового журнала');
    if(who)throw new AdminError(400,'В старых логах нет надёжных ID участников. Используйте поиск по тексту.');
    if(q)where.action={[Op.like]:'%'+q+'%'};
    const {rows,count}=await Logs.findAndCountAll({where,order:[['id','DESC']],limit,offset:(page-1)*limit});
    return {rows:rows.map(r=>({...plain(r),legacy:true})),count,page,limit,options:logOptions,archive:true};
  }
  for(const [key,values,label] of [['type',logTypes,'тип события'],['source',logOptions.sources,'источник'],['status',logOptions.statuses,'статус']])if(query[key])where[key]=option(clean(query[key]),values,label);
  const esc=v=>sequelize.escape(v),table=sequelize.getQueryInterface().queryGenerator.quoteTable(GameLogUser.getTableName());
  const membership=filter=>literal('`gameLog`.`id` IN (SELECT `logId` FROM '+table+' WHERE '+filter+')');
  if(who){
    if(query.userRole==='actor'){
      if(who.userId)where.actorId=who.userId;else if(who.telegramId)where.actorTelegramId=who.telegramId;else{const user=await User.findOne({where:{username:clean(query.user).replace(/^@/,'')},attributes:['id']});where.actorId=user?.id||-1;}
    }else{
      const filter=who.userId?'`userId` = '+esc(who.userId):who.telegramId?'`telegramId` = '+esc(who.telegramId):who.username?'`username` = '+esc(who.username):'(`userId` = '+esc(who[Op.or][0].userId)+' OR `username` = '+esc(who[Op.or][1].username)+')';
      conditions.push(query.includeGlobal==='true'?{[Op.or]:[membership(filter),{global:true}]}:membership(filter));
    }
  }
  if(query.chatId){const chat=clean(query.chatId);if(!/^-?\d{1,20}$/.test(chat))throw new AdminError(400,'Неверный ID чата');where.chatId=chat;}
  if(query.logId){if(!/^\d{1,20}$/.test(clean(query.logId)))throw new AdminError(400,'Неверный ID лога');where.id=clean(query.logId);}
  const object={};
  if(query.resource)object.model=option(clean(query.resource),resourceNames,'объект');
  if(query.entityId){const id=clean(query.entityId);if(!/^-?\d{1,20}$/.test(id))throw new AdminError(400,'Неверный ID объекта');object.entityId=id;}
  if(Object.keys(object).length)conditions.push(literal("JSON_CONTAINS(JSON_EXTRACT(`gameLog`.`details`, '$.changes'), "+esc(JSON.stringify(object))+")"));
  if(query.currency){const currency=option(clean(query.currency),currencyNames,'ресурс');conditions.push(literal("JSON_CONTAINS(JSON_EXTRACT(`gameLog`.`details`, '$.currencies'), "+esc(JSON.stringify(currency))+")"));}
  if(q)conditions.push({[Op.or]:[{action:{[Op.like]:'%'+q+'%'}},literal('CAST(`gameLog`.`details` AS CHAR) LIKE '+esc('%'+q+'%')),membership('`name` LIKE '+esc('%'+q+'%')+' OR `username` LIKE '+esc('%'+q+'%'))]});
  if(conditions.length)where[Op.and]=conditions;
  const {rows,count}=await GameLog.findAndCountAll({where,order:[['id','DESC']],limit,offset:(page-1)*limit});
  const participants=rows.length?await GameLogUser.findAll({where:{logId:{[Op.in]:rows.map(r=>r.id)}},order:[['id','ASC']]}):[];
  return {rows:rows.map(r=>({...plain(r),participants:participants.filter(p=>String(p.logId)===String(r.id)).map(plain)})),count,page,limit,options:logOptions};
}
