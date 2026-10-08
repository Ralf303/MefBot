import { User, Item, Case, Chat, Home, Card, CardStand, Active, Roles, Bonus, FamMember, Family, Bafs, Mining } from '../db/models.js';

const labels = {
  firstname:'Имя', username:'Username', chatId:'Telegram ID', balance:'Баланс старок', famMoney:'Семейные монеты', stones:'Камни', meflvl:'Уровень фермы', timelvl:'Уровень скорости фермы', farmtime:'Таймер фермы', slots:'Вместимость', fullSlots:'Занято слотов', gems:'Самоцветы', takeBonus:'Таймер бонуса', chests:'Ключи', snows:'Снежки', freeze:'Холод', oil:'Нефть', donate:'Донат', coin:'Криптомонеты', captureCounter:'Решённые капчи',
  src:'Изображение', itemName:'Название', bodyPart:'Слот одежды', isWorn:'Надето', price:'Цена', lvl:'Уровень', userId:'Владелец · ID в базе',
  minecraft:'Minecraft', brawl:'Brawl Stars', hotline:'Hotline Miami', fallout:'Fallout', fnaf:'FNAF', gem:'Самоцветный', fam:'Семейный',
  name:'Название', vip:'VIP', vipTime:'Осталось дней VIP', allowCase:'Разрешены кейсы', allowGames:'Разрешены игры', bank:'Банк', chatLink:'Ссылка чата',
  homeId:'Дом из каталога', tax:'Налог', energy:'Электричество', fuel:'Топливо', cardId:'Видеокарта', day:'Активность · день', week:'Активность · неделя', month:'Активность · месяц', status:'Роль', time:'Таймер', familyId:'Семья', rang:'Ранг', owner:'Telegram ID основателя', description:'Описание', reputation:'Репутация', mef:'Семейные старки', percent:'Процент', check:'Значок', active:'Активность', luck:'Удача', craft:'Крафт', farm:'Ферма', capcha:'Капча', invite:'Приглашения', case:'Кейсы', cards:'Видеокарты на рынке', currency:'Курс',
};
const resources = {
  users:{model:User,title:'Пользователь',readonly:['chatId','fullSlots'],search:['firstname','username','chatId'],create:false,remove:false},
  items:{model:Item,title:'Вещь',search:['itemName'],remove:true},
  cases:{model:Case,title:'Кейсы',readonly:['userId'],parent:true},
  chats:{model:Chat,title:'Чат',readonly:['chatId'],search:['chatId','name'],create:false,remove:false},
  homes:{model:Home,title:'Дом',readonly:['userId'],parent:true,remove:true},
  cards:{model:Card,title:'Видеокарта',readonly:['userId'],parent:true,remove:true},
  stands:{model:CardStand,title:'Стойка',readonly:['userId'],parent:true,remove:true},
  activity:{model:Active,title:'Активность',readonly:['userId','chatId'],parent:true},
  roles:{model:Roles,title:'Роль',readonly:['roleId'],hidden:['password'],parent:true,remove:true},
  bonuses:{model:Bonus,title:'Раздача бонуса',create:false,remove:false},
  memberships:{model:FamMember,title:'Участие в семье',readonly:['userId','familyId'],parent:true,remove:false},
  families:{model:Family,title:'Семья',readonly:['owner','fullSlots'],search:['name','owner'],create:false,remove:false},
  buffs:{model:Bafs,title:'Улучшения семьи',readonly:['familyId'],parent:true},
  mining:{model:Mining,title:'Рынок майнинга',create:false,remove:false},
};
export {resources};

// The role association uses roleId. Support databases which instead used userId
// within this admin process only, without altering their schema or API.
export async function prepareAdminSchema(){
  const columns=await Roles.sequelize.getQueryInterface().describeTable(Roles.getTableName());
  if(!columns.roleId&&columns.userId){Roles.rawAttributes.roleId.field='userId';Roles.refreshAttributes();}
}

export function fieldsFor(name) {
  const def=resources[name];
  return Object.entries(def.model.rawAttributes).filter(([key])=>!(def.hidden||[]).includes(key)).map(([key,attr])=>{
    const type=attr.type.key;
    const field={key,label:labels[key]||({id:'ID',roleId:'Владелец · ID в базе',createdAt:'Создан',updatedAt:'Обновлён'}[key]||key),type:type==='BOOLEAN'?'boolean':['INTEGER','BIGINT','FLOAT','DOUBLE'].includes(type)?'number':type==='DATE'?'date':'text',readonly:!!attr.primaryKey||['createdAt','updatedAt'].includes(key)||(def.readonly||[]).includes(key),nullable:attr.allowNull!==false,max:type==='BIGINT'?Number.MAX_SAFE_INTEGER:2147483647,step:type==='FLOAT'||type==='DOUBLE'?'any':1};
    if(key==='bodyPart')field.options=['head','face','set','left','right','extra','legs','leg1','leg2',...Array.from({length:5},(_,i)=>'fnaf_set'+(i+1)),...Array.from({length:7},(_,i)=>'pups_set'+(i+1))];
    if(name==='roles'&&key==='status')field.options=['','manager','founder'];
    if(name==='memberships'&&key==='rang')field.max=5;
    field.min=0;
    if(name==='users'&&['meflvl','timelvl'].includes(key)){field.min=1;field.max=4;}
    if(name==='memberships'&&key==='rang')field.min=1;
    if(name==='families'&&key==='percent')field.max=100;
    if(name==='homes'&&key==='tax')field.max=36000;
    if(name==='homes'&&key==='energy')field.max=10000;
    if(name==='cases'&&key==='donate')field.label='Донатный';
    return field;
  });
}
export const publicSchemas=()=>Object.fromEntries(Object.entries(resources).map(([name,def])=>[name,{title:def.title,fields:fieldsFor(name),remove:!!def.remove,parent:!!def.parent}]));

export function cleanRow(name,row){const data=row?.get?row.get({plain:true}):{...row}; for(const key of resources[name].hidden||[])delete data[key];return data;}

export class AdminError extends Error {constructor(status,message){super(message);this.status=status;}}
export function validateChanges(name,changes){
  if(!changes||typeof changes!=='object'||Array.isArray(changes))throw new AdminError(400,'Неверный формат изменений');
  const fields=fieldsFor(name);const result={};
  if(Object.keys(changes).length>40)throw new AdminError(400,'Слишком много полей');
  for(const [key,value] of Object.entries(changes)){
    const field=fields.find(f=>f.key===key);
    if(!field||field.readonly)throw new AdminError(400,'Поле нельзя изменить: '+key);
    if(value===null){if(!field.nullable||(field.type==='number'&&key!=='cardId')||field.type==='boolean')throw new AdminError(400,'Укажите значение: '+field.label);result[key]=null;continue;}
    if(field.type==='boolean'){if(typeof value!=='boolean')throw new AdminError(400,'Неверный переключатель: '+field.label);result[key]=value;}
    else if(field.type==='number'){
      if(value===''||typeof value==='boolean'||!['number','string'].includes(typeof value))throw new AdminError(400,'Укажите число: '+field.label);
      const n=Number(value);if(!Number.isFinite(n)||n<field.min||n>field.max||(field.step!== 'any'&&!Number.isSafeInteger(n)))throw new AdminError(400,'Число вне допустимого диапазона: '+field.label);result[key]=n;
    }else{if(typeof value!=='string'||value.length>255)throw new AdminError(400,'Текст должен быть короче 256 символов: '+field.label);result[key]=value.trim();}
    if(field.options&&!field.options.includes(result[key]))throw new AdminError(400,'Недопустимое значение: '+field.label);
  }
  return result;
}
export function assertOriginal(row,changes,original){
  if(!original||typeof original!=='object')throw new AdminError(400,'Нужны исходные значения полей');
  for(const key of Object.keys(changes)){
    if(!Object.hasOwn(original,key)||String(row[key]??'')!==String(original[key]??''))throw new AdminError(409,'Данные изменились в боте или другой вкладке. Обновите страницу и повторите правку.');
  }
}
