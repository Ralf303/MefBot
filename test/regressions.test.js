import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";
import { Context } from "telegraf";
import sequelize, { currentTransaction } from "../src/db/config.js";
import { User, Case, Item, Card, CardStand, Payment, CaseCacheMigration, Family, FamMember, Logs, Giveaway } from "../src/db/models.js";
import economy from "../src/services/economy-service.js";
import paymentService from "../src/services/payment-service.js";
import { withUserOperation } from "../src/services/transaction-service.js";
import { purchaseAsset } from "../src/services/trade-service.js";
import { buyItem } from "../src/modules/items-module/items-utils/items-functions.js";
import { openCase } from "../src/modules/case-module/case-utils/open-case-service.js";
import { syncUserCaseToDb } from "../src/db/functions.js";
import { dice } from "../src/modules/game-module/games/dice.js";
import { getWinAmount } from "../src/modules/game-module/games/roulette.js";
import jwt from "../src/services/jwt-service.js";
import bonusService from "../src/services/bonus-service.js";
import { dice_bandit } from "../src/modules/game-module/games/dice-bandit.js";
import commandRouter from "../src/modules/commands-module/commands-router.js";
import vipRouter from "../src/modules/vipChat-module/vipChat-router.js";
import mineRouter from "../src/modules/mine-module/mine-router.js";
import itemsRouter from "../src/modules/items-module/items-router.js";
import caseRouter from "../src/modules/case-module/case-router.js";
import cardRouter from "../src/modules/card-module/card-router.js";
import transferConfirmationRouter from "../src/modules/transfer-module/transfer-confirmation-router.js";
import { ALL } from "../src/utils/transfer-amount.js";
import redis from "../src/services/redis-service.js";
import { createLimiter, withKeyLock } from "../src/utils/concurrency.js";

process.env.JWT_SECRET = "mefbot-test-only-signing-secret";

// Transactional in-memory adapter: no database connections or Telegram traffic.
let database, cache, failSave, committed;
const tables = new Map([[User, "users"], [Case, "cases"], [Item, "items"], [Card, "cards"], [CardStand, "stands"], [Payment, "payments"], [CaseCacheMigration, "migrations"], [Family, "families"], [FamMember, "members"], [Logs, "logs"], [Giveaway, "giveaways"]]);
function rows(model) { return (currentTransaction()?.data || database)[tables.get(model)]; }
function matches(row, where = {}) {
  return Object.entries(where).every(([key, value]) =>
    Array.isArray(value) ? value.includes(row[key]) : String(row[key]) === String(value));
}
function instance(model, values) {
  const object = model.build(values, { isNewRecord: false, raw: true });
  object.save = async (options = {}) => {
    if (failSave?.(model, object)) throw new Error("SIMULATED_DB_FAILURE");
    const data = (options.transaction?.data || currentTransaction()?.data || database)[tables.get(model)];
    const primary = model === CaseCacheMigration ? "userId" : "id";
    const row = data.find(row => String(row[primary]) === String(object[primary]));
    if (!row) throw new Error("MISSING_ROW");
    for (const key of object.changed() || []) row[key] = object[key];
    object._previousDataValues = { ...object.dataValues };
    for (const key of object.changed() || []) object.changed(key, false);
    return object;
  };
  object.update = async values => { object.set(values); return object.save(); };
  object.destroy = async () => { const data=rows(model); const index=data.findIndex(row=>row.id===object.id); if(index>=0)data.splice(index,1); };
  object.addItem = async item => { item.userId=object.id; await item.save(); };
  return object;
}
function snapshot(id = 1) { return instance(User, database.users.find(user => user.id === id)); }
function context(text = "test", type = "private") {
  const ctx = new Context({ update_id: 1, message: { message_id: 1, date: 1, from: { id: 123, first_name: "Test", username: "test" }, chat: { id: type === "private" ? 123 : -123, type, title: "Group" }, text, entities: text.startsWith("/start") ? [{ offset: 0, length: 6, type: "bot_command" }] : [] } }, {}, { id: 999, username: "bot" });
  ctx.state.user=snapshot();
  ctx.notifications=[];
  ctx.reply=ctx.replyWithHTML=async (...args)=>{ ctx.notifications.push(args); };
  ctx.telegram.sendMessage=async (...args)=>{ ctx.notifications.push(args); };
  return ctx;
}
async function pressTransferButton(preview, button = 0, fromId = 123, chat = preview.chat) {
  const keyboard = preview.notifications[0][1].reply_markup.inline_keyboard;
  const data = keyboard.flat()[button].callback_data;
  const ctx = new Context({
    update_id: 2,
    callback_query: { id: "callback", from: { id: fromId, first_name: "Test" }, data, message: { message_id: 2, chat } },
  }, {}, { id: 999, username: "bot" });
  ctx.notifications=[];
  ctx.answers=[];
  ctx.reply=ctx.replyWithHTML=ctx.telegram.sendMessage=async (...args)=>{ ctx.notifications.push(args); };
  ctx.answerCbQuery=async message=>{ ctx.answers.push(message); };
  ctx.editMessageReplyMarkup=async()=>{};
  await transferConfirmationRouter.middleware()(ctx,async()=>{});
  return ctx;
}
beforeEach(() => {
  test.mock.method(console, "error", () => {});
  test.mock.method(console, "log", () => {});
  database=Object.fromEntries([...tables.values()].map(name=>[name,[]]));
  database.users=[User.build({id:1,chatId:"123",firstname:"Test",username:"test",balance:1000,gems:100,donate:0,slots:10,fullSlots:0}).get({plain:true}),User.build({id:2,chatId:"456",balance:0}).get({plain:true})];
  database.cases=[Case.build({id:1,userId:1,minecraft:1}).get({plain:true})];
  cache=new Map(); failSave=null; committed=false;
  redis.get=async key=>cache.get(String(key)) || null;
  redis.set=async(key,value)=>{cache.set(String(key),value);};
  redis.delete=async key=>cache.delete(String(key));
  redis.take=async key=>{const value=cache.get(key);cache.delete(key);return value;};
  sequelize.transaction=async operation=>withKeyLock("test-transaction",async()=>{
    const transaction={data:structuredClone(database),LOCK:{UPDATE:"UPDATE"},callbacks:[],afterCommit(fn){this.callbacks.push(fn);}};
    const result=await sequelize.constructor._cls.run(async()=>{
      sequelize.constructor._cls.set("transaction",transaction);
      return operation(transaction);
    });
    database=transaction.data; committed=true;
    for(const callback of transaction.callbacks)await callback();
    return result;
  });
  for(const [model] of tables){
    model.findByPk=async(id,options={})=>{const primary=model===CaseCacheMigration?"userId":model===Giveaway?"kind":"id";const row=rows(model).find(row=>String(row[primary])===String(id));return row?instance(model,row):null;};
    model.findOne=async(options={})=>{const row=rows(model).find(row=>matches(row,options.where));return row?instance(model,row):null;};
    model.findAll=async(options={})=>rows(model).filter(row=>matches(row,options.where)).map(row=>instance(model,row));
    model.count=async(options={})=>rows(model).filter(row=>matches(row,options.where)).length;
    model.update=async(values, options={})=>{
      const found=await model.findAll(options);
      for(const row of found) await row.update(values);
      return [found.length];
    };
    model.create=async values=>{const row=model.build(values).get({plain:true});if(!row.id && model!==CaseCacheMigration)row.id=Math.max(0,...rows(model).map(row=>row.id||0))+1;rows(model).push(row);return instance(model,row);};
    model.findOrCreate=async(options)=>{const existing=await model.findOne(options);return existing?[existing,false]:[await model.create({...options.defaults,...options.where}),true];};
  }
});

test("both BTC command orders transfer the actual amount; invalid amounts change nothing", async () => {
  database.users[0].coin=12;
  database.users[1].username="recipient";
  const next=async()=>{};
  await mineRouter.middleware()(context("передать крипта 2.5 @recipient"),next);
  assert.deepEqual(database.users.map(user=>user.coin),[12,0]);
  await mineRouter.middleware()(context("передать крипта 2 @recipient"),next);
  assert.deepEqual(database.users.map(user=>user.coin),[10,2]);
  const all=context("Крипта передать ВСЁ @recipient");
  await mineRouter.middleware()(all,next);
  assert.deepEqual(database.users.map(user=>user.coin),[10,2]);
  assert.match(all.notifications[0][0],/@recipient[\s\S]*456[\s\S]*10 BTC/);
  const confirmation=await pressTransferButton(all);
  assert.deepEqual(database.users.map(user=>user.coin),[0,12]);
  assert.match(confirmation.notifications[1][1],/10 ₿/);
});

test("only the requester can use the buttons; cancel, expiry, and concurrent clicks cannot send twice", async () => {
  database.users[0].coin=10;
  database.users[1].username="recipient";
  const preview=async()=>{
    const ctx=context("крипта передать всё @recipient","group");
    await mineRouter.middleware()(ctx,async()=>{});
    return ctx;
  };
  const cancelled=await preview();
  assert.match((await pressTransferButton(cancelled,1,456)).answers[0],/не твоя/);
  assert.match((await pressTransferButton(cancelled,0,123,{...cancelled.chat,id:-987})).answers[0],/не твоя/);
  assert.match((await pressTransferButton(cancelled,1)).notifications[0][0],/отменена/);
  assert.match((await pressTransferButton(cancelled)).answers[0],/закрыта/);
  const expired=await preview();
  cache.clear();
  assert.match((await pressTransferButton(expired)).answers[0],/закрыта/);
  assert.deepEqual(database.users.map(user=>user.coin),[10,0]);
  const live=await preview();
  const results=await Promise.all([pressTransferButton(live),pressTransferButton(live)]);
  assert.equal(results.filter(result=>result.notifications.length>0).length,1);
  assert.deepEqual(database.users.map(user=>user.coin),[0,10]);
});

test("confirmation rejects a balance that changed after the preview", async () => {
  database.users[0].coin=10;
  database.users[1].username="recipient";
  const ctx=context("передать крипта все @recipient");
  await mineRouter.middleware()(ctx,async()=>{});
  database.users[0].coin=11;
  const result=await pressTransferButton(ctx);
  assert.match(result.notifications[0][0],/изменились/);
  assert.deepEqual(database.users.map(user=>user.coin),[11,0]);
});

test("concurrent full balance transfers use locked balances and preserve the minimum", async () => {
  const first=snapshot(), second=snapshot();
  database.users[0].balance=600;
  const transfer=sender=>economy.transfer({sender,receiver:snapshot(2),currency:"balance",amount:ALL,minAmount:100});
  const results=await Promise.allSettled([transfer(first),transfer(second)]);
  assert.equal(results.filter(result=>result.status==="fulfilled").length,1);
  assert.equal(results.find(result=>result.status==="fulfilled").value.amount,600);
  assert.deepEqual(database.users.map(user=>user.balance),[0,600]);
  database.users[0].balance=99;
  await assert.rejects(transfer(first),{code:"MIN_AMOUNT"});
  assert.deepEqual(database.users.map(user=>user.balance),[99,600]);
});

test("giving all items checks capacity, unequips items and updates both inventories", async () => {
  database.users[1].username="recipient";
  database.users[1].slots=2;
  database.items=[{id:1,userId:1,isWorn:true},{id:2,userId:1,isWorn:false},{id:3,userId:2,isWorn:true}];
  const next=async()=>{};
  const rejected=context("передать вещи все @recipient");
  await itemsRouter.middleware()(rejected,next);
  assert.match(rejected.notifications[0][0],/Ничего не передано/);
  assert.deepEqual(database.items.map(item=>item.userId),[1,1,2]);
  database.users[1].slots=3;
  const preview=context("передать вещь всё @recipient");
  await itemsRouter.middleware()(preview,next);
  database.items[1].id=4;
  assert.match((await pressTransferButton(preview)).notifications[0][0],/изменились/);
  const newPreview=context("передать вещь всё @recipient");
  await itemsRouter.middleware()(newPreview,next);
  await pressTransferButton(newPreview);
  assert.deepEqual(database.items.map(item=>[item.userId,item.isWorn]),[[2,false],[2,false],[2,true]]);
  assert.deepEqual(database.users.map(user=>user.fullSlots),[0,3]);
});

test("case transfers support all of one type and all types including donate cases", async () => {
  database.users[1].username="recipient";
  database.cases[0].minecraft=4;
  database.cases[0].donate=3;
  await Case.create({id:2,userId:2,minecraft:1,donate:2});
  const next=async()=>{};
  const one=context("передать старкейс 1 все @recipient");
  await caseRouter.middleware()(one,next);
  assert.match(one.notifications[0][0],/Майнкрафт кейс: 4 шт/);
  assert.deepEqual(database.cases.map(({minecraft,donate})=>[minecraft,donate]),[[4,3],[1,2]]);
  await pressTransferButton(one);
  assert.deepEqual(database.cases.map(({minecraft,donate})=>[minecraft,donate]),[[0,3],[5,2]]);
  const all=context("передать старкейсы всё @recipient");
  await caseRouter.middleware()(all,next);
  assert.match(all.notifications[0][0],/Донат кейс: 3 шт/);
  await pressTransferButton(all);
  assert.deepEqual(database.cases.map(({minecraft,donate})=>[minecraft,donate]),[[0,0],[5,5]]);
});

test("giving all cards unmounts only the cards transferred, retaining card balances", async () => {
  database.users[1].username="recipient";
  database.cards=[{id:1,userId:1,balance:2.5},{id:2,userId:1,balance:0},{id:3,userId:2,balance:5}];
  database.stands=[{id:1,userId:1,cardId:1},{id:2,userId:2,cardId:3}];
  const preview=context("передать видеокарты всё @recipient");
  await cardRouter.middleware()(preview,async()=>{});
  assert.match(preview.notifications[0][0],/2 шт/);
  assert.deepEqual(database.stands.map(stand=>stand.cardId),[1,3]);
  await pressTransferButton(preview);
  assert.deepEqual(database.cards.map(card=>[card.userId,card.balance]),[[2,2.5],[2,0],[2,5]]);
  assert.deepEqual(database.stands.map(stand=>stand.cardId),[null,3]);
});

test("payment failure rolls back its receipt and a retry credits exactly once", async()=>{
  const user=snapshot();
  const payment={currency:"XTR",total_amount:10,invoice_payload:paymentService.createDonatePayload(123,10),telegram_payment_charge_id:"charge"};
  failSave=model=>model===User;
  await assert.rejects(paymentService.applySuccessfulDonate(user,payment),/SIMULATED/);
  assert.equal(database.payments.length,0);
  assert.equal(database.users[0].donate,0);
  failSave=null;
  assert.equal((await paymentService.applySuccessfulDonate(user,payment)).duplicate,false);
  assert.equal((await paymentService.applySuccessfulDonate(user,payment)).duplicate,true);
  assert.equal(database.users[0].donate,10);
  assert.equal(user.donate,10);
  assert.equal(user.changed("donate"),false);
});

test("concurrent debits use current balances and reject overspending", async()=>{
  const results=await Promise.allSettled([economy.wager({user:snapshot(),stake:700,winnings:0}),economy.wager({user:snapshot(),stake:700,winnings:0})]);
  assert.equal(results.filter(result=>result.status==="fulfilled").length,1);
  assert.equal(database.users[0].balance,300);
});

test("game cannot overwrite a concurrent transfer while waiting for Telegram", async()=>{
  const originalRandom=Math.random;Math.random=()=>0;
  let release,entered;
  const gate=new Promise(resolve=>release=resolve);const started=new Promise(resolve=>entered=resolve);
  try{
    const game=dice("2","500",snapshot(),{chat:{type:"private"},reply:async()=>{entered();await gate;}});
    await started;
    await economy.transfer({sender:snapshot(),receiver:snapshot(2),currency:"balance",amount:300});
    release();await game;
    assert.equal(database.users[0].balance,200);
    assert.equal(database.users[1].balance,300);
  }finally{Math.random=originalRandom;release?.();}
});

test("failed asset transfer rolls back money and ownership", async()=>{
  database.users[0].balance=0;database.users[1].balance=1000;
  database.items=[Item.build({id:1,userId:1,itemName:"Test"}).get({plain:true})];
  failSave=model=>model===Item;
  await assert.rejects(purchaseAsset({seller:snapshot(),buyer:snapshot(2),model:Item,id:1,price:300}),/SIMULATED/);
  assert.equal(database.users[0].balance,0);assert.equal(database.users[1].balance,1000);assert.equal(database.items[0].userId,1);
});

test("Telegram replies run after commit and are discarded on rollback", async()=>{
  const ctx=context();ctx.reply=async()=>assert.equal(committed,true);
  await withUserOperation(snapshot(),ctx,async(user,deferred)=>{user.balance-=100;await user.save();await deferred.reply("ok");});
  assert.equal(database.users[0].balance,900);
  let replies=0;ctx.reply=async()=>replies++;
  await assert.rejects(withUserOperation(snapshot(),ctx,async(user,deferred)=>{await deferred.reply("wrong");throw new Error("rollback");}));
  assert.equal(replies,0);
});

test("legacy case cache migration is applied once even if cache deletion fails", async()=>{
  cache.set("1cases",JSON.stringify({minecraft:3}));
  redis.delete=async()=>{throw new Error("redis unavailable");};
  await syncUserCaseToDb(1);
  assert.equal(database.cases[0].minecraft,3);
  database.cases[0].minecraft=2;
  await syncUserCaseToDb(1);
  assert.equal(database.cases[0].minecraft,2);
  assert.equal(database.migrations.length,1);
});

test("case reward failure rolls back case spending and prevents success messages", async()=>{
  const ctx=context();failSave=model=>model===User;
  await assert.rejects(openCase(snapshot(),1,ctx),/SIMULATED/);
  assert.equal(database.cases[0].minecraft,1);
  assert.equal(ctx.notifications.length,0);
});

test("two concurrent opens cannot spend one case twice", async()=>{
  const ctx=context();
  await Promise.all([openCase(snapshot(),1,ctx),openCase(snapshot(),1,ctx)]);
  assert.equal(database.cases[0].minecraft,0);
  assert.equal(ctx.notifications.filter(args=>String(args[0]).startsWith("Ты открыл")).length,1);
});

test("malformed start token is handled without detached promise rejection",async()=>{
  const ctx=context("/start event_invalid");
  await commandRouter.middleware()(ctx,async()=>{});
  await new Promise(resolve=>setImmediate(resolve));
});

test("ordinary group messages bypass VIP network calls",async()=>{
  const ctx=context("обычное сообщение","supergroup");
  ctx.getChat=async()=>assert.fail("unnecessary getChat");
  ctx.telegram.getChatMember=async()=>assert.fail("unnecessary getChatMember");
  let next=false;await vipRouter.middleware()(ctx,async()=>{next=true;});assert.equal(next,true);
});

test("zero is a winning roulette outcome only for the zero bet",()=>{
  assert.equal(getWinAmount(100,"0",0),3500);
  for(const bet of ["чет","нечет","красное","черное","1-12"])assert.equal(getWinAmount(100,bet,0),0);
});

test("render concurrency is bounded and permits are released on errors",async()=>{
  const limit=createLimiter(2);let active=0,maximum=0;
  await Promise.allSettled(Array.from({length:8},(_,id)=>limit(async()=>{active++;maximum=Math.max(maximum,active);await new Promise(resolve=>setImmediate(resolve));active--;if(id===2)throw new Error("render failed");})));
  assert.equal(maximum,2);assert.equal(active,0);
  assert.equal(await limit(async()=>"still works"),"still works");
});

test("item purchase failure rolls back its debit and inventory slot",async()=>{
  const ctx=context();failSave=model=>model===User;
  await assert.rejects(buyItem(snapshot(),{name:"Test",src:"img/bg.png",bodyPart:"head",price:100,canBuy:true},ctx,true),/SIMULATED/);
  assert.equal(database.users[0].balance,1000);assert.equal(database.users[0].fullSlots,0);assert.equal(database.items.length,0);assert.equal(ctx.notifications.length,0);
});


test("slot send failure refunds the reserved stake",async()=>{
  await assert.rejects(dice_bandit(500,snapshot(),{chat:{id:123},session:{stake:500},telegram:{sendDice:async()=>{throw new Error("TELEGRAM_UNAVAILABLE");}}}),/TELEGRAM_UNAVAILABLE/);
  assert.equal(database.users[0].balance,1000);
});

test("BIGINT string balances are treated as numbers",async()=>{
  database.users[0].balance="1000";
  await economy.wager({user:snapshot(),stake:100,winnings:500});
  assert.equal(database.users[0].balance,1400);
});

test("a signed token from a previous giveaway cannot claim the current reward",async()=>{
  const ctx=context();
  const token=jwt.generateToken({id:7},"event");
  database.giveaways=[{kind:"event",token:"different giveaway"}];
  await assert.rejects(bonusService.giveItem(snapshot(),ctx,token),/GIVEAWAY_EXPIRED/);
  assert.equal(database.items.length,0);
});

test("nested operations delay replies until the outer transaction commits",async()=>{
  const ctx=context();let replies=0;ctx.reply=async()=>replies++;
  await sequelize.transaction(async()=>{
    await withUserOperation(snapshot(),ctx,async(user,deferred)=>deferred.reply("ok"));
    assert.equal(replies,0);
  });
  assert.equal(replies,1);
});
