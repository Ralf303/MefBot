import test from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {createAdminApp} from '../src/admin/app.js';
import {validateChanges,assertOriginal,publicSchemas} from '../src/admin/schema.js';
import {conflictingParts,resolveMedia} from '../src/admin/service.js';

test('admin API requires login and CSRF, does not expose credentials, and logout invalidates session',async()=>{
  let updates=0;
  const {app,close}=createAdminApp({username:'alisa',password:'test-admin-password',secure:true,service:{stats:async()=>({users:3}),update:async()=>{updates++;return {id:1};}}});
  const server=app.listen(0,'127.0.0.1');await once(server,'listening');
  const base='http://127.0.0.1:'+server.address().port;
  try{
    assert.equal((await fetch(base+'/admin/api/stats')).status,401);
    const login=await fetch(base+'/admin/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'alisa',password:'test-admin-password'})});
    assert.equal(login.status,200);const cookie=login.headers.get('set-cookie');assert.match(cookie,/HttpOnly/);assert.match(cookie,/Secure/);assert.match(cookie,/SameSite=Strict/);assert.match(cookie,/Path=\/admin/);
    const session=await login.json();assert.equal(session.password,undefined);assert.ok(session.csrf);
    const headers={'Content-Type':'application/json',Cookie:cookie.split(';')[0]};
    assert.equal((await fetch(base+'/admin/api/stats',{headers})).status,200);
    assert.equal((await fetch(base+'/admin/api/records/users/1',{method:'PATCH',headers,body:'{}'})).status,403);assert.equal(updates,0);
    headers['X-CSRF-Token']=session.csrf;
    assert.equal((await fetch(base+'/admin/api/records/users/1',{method:'PATCH',headers,body:'{}'})).status,200);assert.equal(updates,1);
    assert.equal((await fetch(base+'/admin/api/logout',{method:'POST',headers,body:'{}'})).status,200);
    assert.equal((await fetch(base+'/admin/api/stats',{headers})).status,401);
    assert.equal((await fetch(base+'/admin/media?src=img/bg.png')).status,401);
    assert.equal((await fetch(base+'/admin/')).status,200);
  }finally{close();await new Promise(resolve=>server.close(resolve));}
});

test('admin login rejects wrong credentials and limits repeated guesses',async()=>{
  const {app,close}=createAdminApp({username:'alisa',password:'test-admin-password',secure:false});
  const server=app.listen(0,'127.0.0.1');await once(server,'listening');
  try{const url='http://127.0.0.1:'+server.address().port+'/admin/api/login';for(let i=0;i<8;i++)assert.equal((await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:'{"username":"alisa","password":"wrong"}'})).status,401);assert.equal((await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:'{"username":"alisa","password":"test-admin-password"}'})).status,429);}finally{close();await new Promise(resolve=>server.close(resolve));}
});

test('admin validation blocks identity changes, fractional currency, unsafe values and invalid switches',()=>{
  assert.throws(()=>validateChanges('users',{chatId:'new'}));assert.throws(()=>validateChanges('users',{balance:1.5}));assert.throws(()=>validateChanges('users',{balance:Number.MAX_SAFE_INTEGER+1}));assert.throws(()=>validateChanges('users',{gems:-1}));assert.throws(()=>validateChanges('chats',{vip:'true'}));
  assert.deepEqual(validateChanges('users',{balance:'1500',firstname:' New '}),{balance:1500,firstname:'New'});
  assert.deepEqual(validateChanges('stands',{cardId:null}),{cardId:null});
  assert.equal(publicSchemas().roles.fields.some(f=>f.key==='password'),false);
});

test('admin optimistic update rejects stale fields without rejecting unrelated bot changes',()=>{
  assert.throws(()=>assertOriginal({balance:120},{balance:200},{balance:100}),e=>e.status===409);
  assert.doesNotThrow(()=>assertOriginal({firstname:'Alice',balance:120},{firstname:'Alisa'},{firstname:'Alice',balance:100}));
  assert.throws(()=>assertOriginal({balance:100},{balance:200},{}));
});

test('admin media paths cannot escape item images or load executable files',async()=>{
  await assert.rejects(resolveMedia('img/../package.json'));
  await assert.rejects(resolveMedia('https://example.com/image.png'));
  await assert.rejects(resolveMedia('img/image.svg'));
  await assert.rejects(resolveMedia('../img/bg.png'));
});

test('admin clothing changes preserve the bot clothing exclusions',()=>{
  assert.equal(conflictingParts('head','set'),true);assert.equal(conflictingParts('leg1','legs'),true);assert.equal(conflictingParts('fnaf_set1','pups_set2'),true);assert.equal(conflictingParts('fnaf_set1','fnaf_set2'),false);assert.equal(conflictingParts('leg1','leg2'),false);assert.equal(conflictingParts('head','right'),false);
});
