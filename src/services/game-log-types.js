export const logTypes={
  'user.register':'Регистрация','currency.transfer':'Перевод ресурсов','currency.exchange':'Обмен ресурсов',
  'item.transfer':'Передача вещи','case.transfer':'Передача кейсов','shop.buy':'Покупка','shop.sell':'Продажа',
  'case.open':'Открытие кейса','craft':'Крафт','item.equip':'Одежда: надеть / снять','item.upgrade':'Улучшение вещи',
  'item.change':'Изменение вещи','inventory.slots':'Расширение инвентаря','farm.harvest':'Сбор фермы','farm.upgrade':'Улучшение фермы',
  'game.play':'Игра / ставка','payment':'Оплата доната','reward':'Награда / бонус','giveaway':'Раздача',
  'family.create':'Создание семьи','family.bank':'Банк семьи','family.member':'Участники и ранги семьи',
  'family.settings':'Настройки и улучшения семьи','family.delete':'Удаление семьи',
  'home.change':'Действия с домом','card.change':'Майнинг и видеокарты','chat.settings':'Настройки чата / VIP',
  'admin.change':'Действие администратора','moderation.command':'Команда модерации','operation':'Другая игровая операция','error':'Ошибка обработки',
};
export const resourceNames={user:'Пользователь',item:'Вещь',case:'Кейсы',home:'Дом',card:'Видеокарта',cardStand:'Стойка',family:'Семья',famMember:'Участник семьи',Bafs:'Улучшения семьи',chat:'Чат',payment:'Платёж',add:'Участие в раздаче',bonus:'Бонус',giveaway:'Раздача',mining:'Рынок майнинга',roles:'Роль',active:'Активность'};
export const currencyNames={balance:'Старки',famMoney:'Семейные монеты',stones:'Камни',gems:'Гемы',chests:'Ключи',snows:'Снежки',freeze:'Охлаждающие жидкости',oil:'Смазки',donate:'Донат',coin:'BTC'};
export function classifyLog(command,changes=[],notes=[]){
  const c=command.toLowerCase(),has=model=>changes.some(x=>x.model===model),field=key=>changes.some(x=>Object.hasOwn(x.after||{},key)||Object.hasOwn(x.before||{},key));
  if(notes.find(n=>n.type))return notes.find(n=>n.type).type;
  if(has('payment'))return 'payment';
  if(/^(выдать|админка|основатель|-ферма|дом задать)/.test(c)||has('roles'))return 'admin.change';
  if(/^(передать|дать)/.test(c)){if(has('item'))return 'item.transfer';if(has('case'))return 'case.transfer';return 'currency.transfer';}
  if(changes.some(x=>x.model==='user'&&x.operation==='create'))return 'user.register';
  if(/^(актив|капча|\d{6}$)/.test(c))return 'reward';
  if(has('family')||has('famMember')||has('Bafs')){
    if(changes.some(x=>x.model==='family'&&x.operation==='create'))return 'family.create';
    if(changes.some(x=>x.model==='family'&&x.operation==='delete'))return 'family.delete';
    if(has('famMember'))return 'family.member';
    if(/снять|пополнить/.test(c))return 'family.bank';return 'family.settings';
  }
  if(/рулет|roulette|бандит|кости|dice|ставка|казино|^(рп|рб)(?:\s|$)/.test(c))return 'game.play';
  if(/крафт|скрафт/.test(c))return 'craft';
  if(/открыть|^кейс/.test(c)&&has('case'))return 'case.open';
  if(/продать|sell|homesell/.test(c))return 'shop.sell';
  if(/купить|buy/.test(c))return 'shop.buy';
  if(has('item')&&field('isWorn'))return 'item.equip';
  if(has('item')&&field('lvl')||/^улучшить вещь/.test(c))return 'item.upgrade';
  if(has('card')||has('cardStand')||/^улучшить (видео)?карту/.test(c))return 'card.change';
  if(has('home'))return 'home.change';
  if(has('chat'))return 'chat.settings';
  if(has('add')||has('giveaway')||/раздача|^\/start/.test(c))return 'giveaway';
  if(field('meflvl')||field('timelvl'))return 'farm.upgrade';
  if(field('slots'))return 'inventory.slots';
  if(/ферм|собрать|фарм/.test(c))return 'farm.harvest';
  if(/бонус|актив|капча|^\d{6}$/.test(c))return 'reward';
  if(/обмен/.test(c))return 'currency.exchange';
  if(has('item'))return 'item.change';return 'operation';
}
