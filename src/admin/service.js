import fs from 'node:fs/promises';
import path from 'node:path';
import {Op,fn,col,literal} from 'sequelize';
import sequelize from '../db/config.js';
import {User,Item,Case,Chat,Home,Card,CardStand,Active,Family,FamMember,Payment,Logs} from '../db/models.js';
import itemsConfig from '../modules/items-module/items.js';
import {home as homesConfig} from '../modules/home-module/home.js';
import redis from '../services/redis-service.js';
import {AdminAudit} from './audit-model.js';
import {resources,cleanRow,validateChanges,assertOriginal,AdminError} from './schema.js';

const root=process.cwd();
const primary=name=>resources[name].model.primaryKeyAttribute;
const defFor=name=>{if(!Object.hasOwn(resources,name))throw new AdminError(404,'Раздел не найден');return resources[name];};
const idOf=(name,id)=>{if(name==='chats'){if(!/^-?\d{1,20}$/.test(String(id)))throw new AdminError(400,'Неверный ID чата');return String(id);}const n=Number(id);if(!Number.isSafeInteger(n)||n<1)throw new AdminError(400,'Неверный ID');return n;};
const plain=row=>row?.get?row.get({plain:true}):row;
const ownerModelNames=['items','cases','homes','cards','stands','activity','roles','bonuses'];
const audit=(actor,name,id,operation,before,after,transaction)=>AdminAudit.create({actor,entity:name,entityId:String(id),operation,before,after},{transaction});
const catalog=Object.entries(itemsConfig).map(([id,item])=>({id:Number(id),...item}));
let statsCache;

export function conflictingParts(a,b){
  if(a===b)return true;
  if((a==='set'&&['head','face'].includes(b))||(b==='set'&&['head','face'].includes(a)))return true;
  const sets=x=>/^fnaf_set\d+$/.test(x)||/^pups_set\d+$/.test(x);
  if(sets(a)&&sets(b))return a.startsWith('fnaf_')!==b.startsWith('fnaf_');
  if((sets(a)&&['legs','leg1','leg2'].includes(b))||(sets(b)&&['legs','leg1','leg2'].includes(a)))return true;
  return (a==='legs'&&['leg1','leg2'].includes(b))||(b==='legs'&&['leg1','leg2'].includes(a));
}

export async function resolveMedia(src){
  if(typeof src!=='string'||src.length>255||src.includes('\\')||!/^(?:\.\/)?img\//.test(src)||!/\.(png|jpe?g|gif|webp|apng)$/i.test(src))throw new AdminError(400,'Недопустимое изображение');
  const base=await fs.realpath(path.join(root,'img'));
  let full;try{full=await fs.realpath(path.resolve(root,src));}catch{throw new AdminError(404,'Изображение не найдено');}
  if(!full.startsWith(base+path.sep))throw new AdminError(400,'Недопустимый путь');
  return full;
}

async function invalidate(userIds){
  for(const id of userIds){
    try{await redis.delete('src_'+id);}catch(e){console.error('Admin cache invalidation:',e.message);}
    try{const names=await fs.readdir(path.join(root,'anims'));await Promise.all(names.filter(f=>f.startsWith(id+'_')&&f.endsWith('.mp4')).map(f=>fs.unlink(path.join(root,'anims',f)).catch(()=>{})));}catch{}
  }
  statsCache=null;
}
async function lockUsers(ids,transaction){
  const users=new Map();for(const id of [...new Set(ids.filter(Boolean).map(Number))].sort((a,b)=>a-b)){const u=await User.findByPk(id,{transaction,lock:transaction.LOCK.UPDATE});if(!u)throw new AdminError(404,'Пользователь не найден');users.set(id,u);}return users;
}
async function capacity(user,transaction,additional=0){const count=await Item.count({where:{userId:user.id},transaction});if(count+additional>Number(user.slots))throw new AdminError(400,'Недостаточно слотов у пользователя. Сначала увеличьте вместимость.');return count;}
async function recount(users,transaction){for(const user of users.values()){const count=await Item.count({where:{userId:user.id},transaction});await user.update({fullSlots:count},{transaction});}}
async function equip(item,transaction){if(!item.isWorn)return;const worn=await Item.findAll({where:{userId:item.userId,isWorn:true,id:{[Op.ne]:item.id}},transaction,lock:transaction.LOCK.UPDATE});for(const other of worn)if(conflictingParts(item.bodyPart,other.bodyPart))await other.update({isWorn:false},{transaction});}

export const adminService={
  catalogue:()=>({items:catalog,homes:Object.entries(homesConfig).map(([id,item])=>({id:Number(id),...item}))}),
  async list(name,query={}){
    const def=defFor(name),page=Math.max(1,Math.min(100000,Number(query.page)||1)),limit=Math.min(100,Math.max(1,Number(query.limit)||30));
    if(!Number.isInteger(page)||!Number.isInteger(limit))throw new AdminError(400,'Неверная страница');
    const where={},q=String(query.q||'').trim().slice(0,100);
    if(q){const search=(def.search||[]).map(key=>({[key]:{[Op.like]:'%'+q+'%'}}));if(/^\d+$/.test(q)&&primary(name)==='id')search.push({id:q});if(name==='items'&&/^\d+$/.test(q))search.push({userId:q});if(search.length)where[Op.or]=search;}
    if(query.userId&&ownerModelNames.includes(name))where.userId=idOf('users',query.userId);
    if(name==='memberships'&&query.userId)where.userId=String(query.userId);
    if(name==='buffs'&&query.familyId)where.familyId=idOf('families',query.familyId);
    if(name==='items'&&query.worn==='true')where.isWorn=true;
    if(name==='chats'&&query.vip==='true')where.vip=true;
    const sorts={recent:['createdAt','DESC'],updated:['updatedAt','DESC'],balance:['balance','DESC'],id:[primary(name),'DESC']};
    let order=sorts[query.sort]||sorts.id;if(!def.model.rawAttributes[order[0]])order=sorts.id;
    const {rows,count}=await def.model.findAndCountAll({where,limit,offset:(page-1)*limit,order:[order],attributes:{exclude:def.hidden||[]}});
    return {rows:rows.map(row=>cleanRow(name,row)),count,page,limit};
  },
  async detail(name,id){
    const def=defFor(name);id=idOf(name,id);const row=await def.model.findByPk(id,{attributes:{exclude:def.hidden||[]}});if(!row)throw new AdminError(404,'Запись не найдена');
    const result={row:cleanRow(name,row)};
    if(name==='users'){
      const [itemCount,cardCount,standCount,membership]=await Promise.all([Item.count({where:{userId:id}}),Card.count({where:{userId:id}}),CardStand.count({where:{userId:id}}),FamMember.findOne({where:{userId:row.chatId}})]);
      result.counts={items:itemCount,cards:cardCount,stands:standCount};result.membership=plain(membership);if(membership)result.family=plain(await Family.findByPk(membership.familyId));
    }
    if(ownerModelNames.includes(name)&&row.userId){const user=await User.findByPk(row.userId,{attributes:['id','firstname','username','chatId']});result.owner=plain(user);}
    if(name==='items')result.catalogue=catalog.find(c=>c.name===row.itemName)||null;
    return result;
  },
  async update(name,id,body,actor){
    const def=defFor(name);id=idOf(name,id);const changes=validateChanges(name,body.changes);if(!Object.keys(changes).length)throw new AdminError(400,'Нет изменений');
    if(name==='items'&&changes.src)await resolveMedia(changes.src);
    const pre=await def.model.findByPk(id);if(!pre)throw new AdminError(404,'Запись не найдена');
    const userIds=name==='users'?[id]:ownerModelNames.includes(name)?[pre.userId,...(name==='items'&&changes.userId?[changes.userId]:[])]:[];
    const result=await sequelize.transaction(async transaction=>{
      const users=await lockUsers(userIds,transaction);
      const row=await def.model.findByPk(id,{transaction,lock:transaction.LOCK.UPDATE});if(!row)throw new AdminError(404,'Запись не найдена');
      if(ownerModelNames.includes(name)&&String(row.userId)!==String(pre.userId))throw new AdminError(409,'Владелец изменился. Обновите страницу.');
      assertOriginal(row,changes,body.original);const before=cleanRow(name,row);
      if(name==='users'&&changes.slots!==undefined){const count=await Item.count({where:{userId:id},transaction});if(changes.slots<count)throw new AdminError(400,'Вместимость меньше количества вещей: '+count);}
      if(name==='items'&&changes.userId!==undefined&&Number(changes.userId)!==Number(row.userId)){await capacity(users.get(Number(changes.userId)),transaction,1);changes.isWorn=false;}
      if(name==='homes'&&changes.homeId!==undefined&&!homesConfig[changes.homeId])throw new AdminError(400,'Такого дома нет в каталоге');
      if(name==='stands'&&changes.cardId!==undefined&&changes.cardId!==null){const card=await Card.findByPk(changes.cardId,{transaction,lock:transaction.LOCK.UPDATE});if(!card||Number(card.userId)!==Number(row.userId))throw new AdminError(400,'Видеокарта должна принадлежать этому пользователю');}
      row.set(changes);await row.save({transaction});
      if(name==='items'){await equip(row,transaction);await recount(users,transaction);}
      await audit(actor,name,id,'update',before,cleanRow(name,row),transaction);return cleanRow(name,row);
    });
    await invalidate(userIds);return result;
  },
  async grantItem(userId,body,actor){
    userId=idOf('users',userId);const item=itemsConfig[body.catalogId],quantity=Number(body.quantity||1);
    if(!item||!Number.isInteger(quantity)||quantity<1||quantity>50)throw new AdminError(400,'Выберите вещь и количество от 1 до 50');
    await resolveMedia(item.src);
    const rows=await sequelize.transaction(async transaction=>{
      const users=await lockUsers([userId],transaction);await capacity(users.get(userId),transaction,quantity);const rows=[];
      for(let i=0;i<quantity;i++){const row=await Item.create({userId,itemName:item.name,src:item.src,bodyPart:item.bodyPart,price:item.price??0,lvl:0,isWorn:false},{transaction});rows.push(cleanRow('items',row));await audit(actor,'items',row.id,'create',null,cleanRow('items',row),transaction);}
      await recount(users,transaction);return rows;
    });await invalidate([userId]);return rows;
  },
  async createOwned(name,userId,body,actor){
    if(!['cases','homes','cards','stands','roles','bonuses','activity'].includes(name))throw new AdminError(400,'Создание недоступно');
    userId=idOf('users',userId);const def=defFor(name),changes=validateChanges(name,body);
    if(name==='homes'){if(!homesConfig[changes.homeId])throw new AdminError(400,'Выберите дом из каталога');if(!changes.name)changes.name=homesConfig[changes.homeId].name;}
    if(name==='stands')changes.cardId=null;
    const row=await sequelize.transaction(async transaction=>{
      await lockUsers([userId],transaction);
      if(!['cards','stands'].includes(name)&&await def.model.findOne({where:{userId},transaction}))throw new AdminError(409,'Такая запись уже есть');
      const row=await def.model.create({...changes,userId},{transaction});await audit(actor,name,row[primary(name)],'create',null,cleanRow(name,row),transaction);return cleanRow(name,row);
    });await invalidate([userId]);return row;
  },
  async remove(name,id,body,actor){
    const def=defFor(name);if(!def.remove)throw new AdminError(400,'Удаление недоступно');id=idOf(name,id);const pre=await def.model.findByPk(id);if(!pre)throw new AdminError(404,'Запись не найдена');
    const ids=pre.userId?[pre.userId]:[];
    await sequelize.transaction(async transaction=>{
      const users=await lockUsers(ids,transaction);const row=await def.model.findByPk(id,{transaction,lock:transaction.LOCK.UPDATE});if(!row||String(row.userId)!==String(pre.userId))throw new AdminError(409,'Запись изменилась');
      if(!body.original||new Date(body.original.updatedAt).getTime()!==new Date(row.updatedAt).getTime())throw new AdminError(409,'Запись изменилась. Обновите страницу.');
      const before=cleanRow(name,row);if(name==='cards')await CardStand.update({cardId:null},{where:{cardId:row.id},transaction});await row.destroy({transaction});if(name==='items')await recount(users,transaction);await audit(actor,name,id,'delete',before,null,transaction);
    });await invalidate(ids);return {ok:true};
  },
  async stats(){
    if(statsCache&&statsCache.until>Date.now())return statsCache.value;
    const since=new Date(Date.now()-86400000),week=new Date(Date.now()-7*86400000);
    const [users,items,chats,families,homes,cards,newUsers,changedUsers,vipChats,totals,caseTotals,payments,registrations,topUsers,recentAudits]=await Promise.all([
      User.count(),Item.count(),Chat.count(),Family.count(),Home.count(),Card.count(),User.count({where:{createdAt:{[Op.gte]:since}}}),User.count({where:{updatedAt:{[Op.gte]:since}}}),Chat.count({where:{vip:true}}),
      User.findOne({attributes:[[fn('SUM',col('balance')),'balance'],[fn('SUM',col('donate')),'donate'],[fn('SUM',col('gems')),'gems']],raw:true}),
      Case.findOne({attributes:Object.keys(Case.rawAttributes).filter(k=>!['id','userId','createdAt','updatedAt'].includes(k)).map(k=>[fn('SUM',col(k)),k]),raw:true}),
      Payment.findOne({attributes:[[fn('COUNT',col('id')),'count'],[fn('SUM',col('amount')),'amount']],where:{createdAt:{[Op.gte]:week}},raw:true}),
      User.findAll({attributes:[[fn('DATE',col('createdAt')),'day'],[fn('COUNT',col('id')),'count']],where:{createdAt:{[Op.gte]:new Date(Date.now()-13*86400000)}},group:[fn('DATE',col('createdAt'))],order:[[fn('DATE',col('createdAt')),'ASC']],raw:true}),
      User.findAll({attributes:['id','firstname','username','balance'],order:[['balance','DESC']],limit:5}),
      AdminAudit.findAll({order:[['id','DESC']],limit:5}),
    ]);
    const value={users,items,chats,families,homes,cards,newUsers,changedUsers,vipChats,totals,caseTotals,payments,registrations,topUsers:topUsers.map(plain),recentAudits:recentAudits.map(plain),generatedAt:new Date().toISOString()};statsCache={value,until:Date.now()+30000};return value;
  },
  async history(query={}){const page=Math.max(1,Math.min(100000,Math.trunc(Number(query.page)||1)));const where={};if(query.entity&&resources[query.entity])where.entity=query.entity;if(query.entityId)where.entityId=String(query.entityId).slice(0,30);const {rows,count}=await AdminAudit.findAndCountAll({where,order:[['id','DESC']],limit:30,offset:(page-1)*30});return {rows:rows.map(plain),count,page,limit:30};},
  async botLogs(query={}){const page=Math.max(1,Math.min(100000,Math.trunc(Number(query.page)||1)));const where=query.q?{action:{[Op.like]:'%'+String(query.q).slice(0,100)+'%'}}:{};const {rows,count}=await Logs.findAndCountAll({where,order:[['id','DESC']],limit:30,offset:(page-1)*30});return {rows:rows.map(plain),count,page,limit:30};},
};
