import crypto from 'node:crypto';
import {AdminError} from './schema.js';

export function createAuth({username,password,secure=true,sessionMs=12*60*60*1000}){
  if(!username||!password)throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD required');
  const sessions=new Map(),attempts=new Map();
  const salt=crypto.randomBytes(16),expected=crypto.scryptSync(password,salt,32);
  const cookieName='mef_admin_session';
  const cookieOptions={httpOnly:true,secure,sameSite:'strict',path:'/admin',maxAge:sessionMs};
  const clean=()=>{const now=Date.now();for(const [key,s] of sessions)if(s.expires<=now)sessions.delete(key);for(const [key,a] of attempts)if(a.until<=now)attempts.delete(key);};
  const timer=setInterval(clean,60000);timer.unref();
  const token=req=>{const value=(req.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(cookieName+'='));return value?.slice(cookieName.length+1);};
  const find=req=>{const id=token(req),s=sessions.get(id);if(!s||s.expires<=Date.now()){sessions.delete(id);return null;}return s;};
  const guard=(req,res,next)=>{const s=find(req);if(!s)return res.status(401).json({error:'Войдите в админку'});req.admin=s;next();};
  const csrf=(req,res,next)=>{if(!req.admin||req.headers['x-csrf-token']!==req.admin.csrf)return res.status(403).json({error:'Сессия изменилась. Обновите страницу'});next();};
  const login=async(req,res)=>{
    clean();const ip=req.ip,a=attempts.get(ip);if(a&&a.count>=8)throw new AdminError(429,'Слишком много попыток. Попробуйте через 15 минут.');
    const input=req.body||{};if(typeof input.password!=='string'||input.password.length>256||typeof input.username!=='string'||input.username.length>80)throw new AdminError(400,'Укажите логин и пароль');
    const attempt=a||{count:0,until:Date.now()+15*60*1000};attempt.count++;
    if(attempts.size>=5000&&!attempts.has(ip))attempts.delete(attempts.keys().next().value);
    attempts.set(ip,attempt);
    const hash=await new Promise((resolve,reject)=>crypto.scrypt(input.password,salt,32,(err,key)=>err?reject(err):resolve(key)));
    if(input.username!==username||!crypto.timingSafeEqual(hash,expected))throw new AdminError(401,'Неверный логин или пароль');
    attempts.delete(ip);const old=token(req);if(old)sessions.delete(old);
    const id=crypto.randomBytes(32).toString('base64url'),s={username,csrf:crypto.randomBytes(24).toString('base64url'),expires:Date.now()+sessionMs};
    if(sessions.size>=1000)sessions.delete(sessions.keys().next().value);
    sessions.set(id,s);res.cookie(cookieName,id,cookieOptions);res.json({username,csrf:s.csrf});
  };
  const logout=(req,res)=>{sessions.delete(token(req));res.clearCookie(cookieName,{...cookieOptions,maxAge:undefined});res.json({ok:true});};
  return {guard,csrf,login,logout,close:()=>clearInterval(timer)};
}
