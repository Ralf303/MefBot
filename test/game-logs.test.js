import test from 'node:test';
import assert from 'node:assert/strict';
import sequelize from '../src/db/config.js';
import {User,Item} from '../src/db/models.js';
import {GameLog,GameLogUser} from '../src/services/game-log-model.js';
import {withLogContext,installGameLogHooks,diffValues,gameLogMiddleware} from '../src/services/game-log-service.js';
import {classifyLog} from '../src/services/game-log-types.js';
import {dateRange} from '../src/admin/game-logs.js';

test('journal captures committed actions, isolates concurrent requests and ignores background noise',async()=>{
  const stored=[],members=[];
  const original={transaction:sequelize.transaction,users:User.findAll,create:GameLog.create,bulk:GameLogUser.bulkCreate};
  sequelize.transaction=async fn=>fn({});
  User.findAll=async()=>[{id:1,chatId:'101',firstname:'Алиса',username:'alice'},{id:2,chatId:'102',firstname:'Боб',username:'bob'}];
  GameLog.create=async values=>{const row={...values,id:stored.length+1};stored.push(row);return row;};
  GameLogUser.bulkCreate=async rows=>{members.push(...rows);};
  installGameLogHooks();
  const tx=parent=>({parent,callbacks:[],afterCommit(fn){this.callbacks.push(fn);},async commit(){this.finished='commit';for(const fn of this.callbacks)await fn();},rollback(){this.finished='rollback';}});
  const save=async(model,before,after,transaction)=>{
    const row={constructor:model,isNewRecord:!before,_previousDataValues:before,get:()=>after},options={transaction};
    await sequelize.runHooks('beforeSave',row,options);await sequelize.runHooks('afterSave',row,options);
  };
  try{
    await save(User,{id:1,gems:1},{id:1,gems:2});assert.equal(stored.length,0,'hourly cron has no request context');
    await save(User,{id:1,chests:1},{id:1,chests:2});assert.equal(stored.length,0,'daily key grant has no request context');
    await withLogContext({command:'Просмотр профиля'},()=>save(User,{id:1,firstname:'A',username:'a'},{id:1,firstname:'B',username:'b'}));assert.equal(stored.length,0,'Telegram name synchronization is ignored');
    await withLogContext({command:'передать гемы',actorId:1},async()=>{
      const transaction=tx();
      await save(User,{id:1,chatId:'101',gems:10},{id:1,chatId:'101',gems:7},transaction);
      await save(User,{id:2,chatId:'102',gems:0},{id:2,chatId:'102',gems:3},transaction);
      assert.equal(stored.length,0);await transaction.commit();
    });
    assert.equal(stored[0].type,'currency.transfer');assert.equal(stored[0].details.changes.length,2);assert.deepEqual(stored[0].details.currencies,['gems']);assert.equal(members.filter(r=>r.logId===1).length,2);
    await withLogContext({command:'купить вещь'},async()=>{const transaction=tx();await save(Item,null,{id:9,userId:1,itemName:'Шапка'},transaction);transaction.rollback();});assert.equal(stored.length,1,'rollback cannot create a success log');
    await withLogContext({command:'Платёж'},async()=>{const root=tx(),child=tx(root);await save(User,{id:1,donate:0},{id:1,donate:10},child);await child.commit();root.rollback();});assert.equal(stored.length,1,'savepoint commit is not outer commit');
    await Promise.all([withLogContext({command:'А',actorId:1},()=>save(User,{id:1,balance:1},{id:1,balance:2})),withLogContext({command:'Б',actorId:2},()=>save(User,{id:2,balance:2},{id:2,balance:3}))]);
    assert.equal(stored.length,3);assert.equal(stored.find(r=>r.details.command==='А').details.changes[0].entityId,'1');assert.equal(stored.find(r=>r.details.command==='Б').details.changes[0].entityId,'2');
    await withLogContext({command:'admin edit',source:'admin'},()=>save(User,{id:1,username:'a',password:'secret'},{id:1,username:'b',password:'newsecret'}));assert.equal(stored.at(-1).details.changes[0].after.username,'b');assert.ok(!JSON.stringify(stored).includes('secret'));
    GameLog.create=async()=>{throw new Error('storage down');};await assert.doesNotReject(withLogContext({command:'Действие'},()=>save(User,{id:1,balance:2},{id:1,balance:3})));
    const before=stored.length;let ctx={from:{id:101},chat:{id:-100},message:{text:'/start event_secret-token'},state:{}};
    GameLog.create=async values=>{stored.push({...values,id:stored.length+1});return stored.at(-1);};
    await gameLogMiddleware(ctx,()=>save(User,{id:1,balance:3},{id:1,balance:4}));assert.equal(stored.length,before+1);assert.ok(!JSON.stringify(stored.at(-1)).includes('secret-token'));
    await assert.rejects(withLogContext({command:'Ошибка'},async()=>{throw new TypeError('test');}));assert.equal(stored.at(-1).type,'error');assert.equal(stored.at(-1).status,'error');
  }finally{sequelize.transaction=original.transaction;User.findAll=original.users;GameLog.create=original.create;GameLogUser.bulkCreate=original.bulk;}
});
test('journal excludes secrets, classifies operations and validates calendar filters',()=>{
  assert.deepEqual(diffValues('roles',{password:'a',status:'manager'},{password:'b',status:'founder'}),{before:{status:'manager'},after:{status:'founder'}});
  assert.equal(classifyLog('Сцена rouletteScene',[{model:'user',after:{balance:1}}]),'game.play');
  assert.equal(classifyLog('семья пополнить',[{model:'family',after:{mef:1}}]),'family.bank');
  assert.equal(classifyLog('открыть кейс',[{model:'case',after:{minecraft:0}}]),'case.open');
  assert.equal(classifyLog('123456',[{model:'user',after:{captureCounter:1}},{model:'family',after:{reputation:30}}]),'captcha');
  assert.equal(classifyLog('капча',[{model:'user',after:{balance:500}}]),'captcha');
  assert.equal(classifyLog('Ответ на капчу',[{model:'user',after:{captureCounter:1}}]),'captcha');
  assert.equal(classifyLog('актив',[{model:'user',after:{balance:500}}]),'reward');
  assert.equal(classifyLog('передать ключи',[{model:'user',after:{chests:1}}]),'currency.transfer');
  assert.throws(()=>dateRange({from:'2026-02-30'}));assert.throws(()=>dateRange({from:'2026-10-09',to:'2026-10-08'}));assert.doesNotThrow(()=>dateRange({from:'2026-10-08',to:'2026-10-08'}));
});
