import express from 'express';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createAuth} from './auth.js';
import {adminService,resolveMedia} from './service.js';
import {publicSchemas,AdminError} from './schema.js';

export function createAdminApp({username,password,secure=true,service=adminService}){
  const app=express();app.disable('x-powered-by');app.enable('strict routing');app.set('trust proxy','loopback');
  const auth=createAuth({username,password,secure});
  app.use('/admin',(req,res,next)=>{
    res.set({'X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'same-origin','Cache-Control':'no-store','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"});next();
  });
  app.use('/admin/api',express.json({limit:'32kb'}));
  const route=fn=>(req,res,next)=>Promise.resolve(fn(req,res)).catch(next);
  app.post('/admin/api/login',route(auth.login));
  app.use('/admin/api',auth.guard);
  app.get('/admin/api/session',(req,res)=>res.json({username:req.admin.username,csrf:req.admin.csrf}));
  app.use('/admin/api',(req,res,next)=>['GET','HEAD'].includes(req.method)?next():auth.csrf(req,res,next));
  app.post('/admin/api/logout',auth.logout);
  app.get('/admin/api/schema',(req,res)=>res.json(publicSchemas()));
  app.get('/admin/api/catalogue',route(async(req,res)=>res.json(await service.catalogue())));
  app.get('/admin/api/stats',route(async(req,res)=>res.json(await service.stats())));
  app.get('/admin/api/history',route(async(req,res)=>res.json(await service.history(req.query))));
  app.get('/admin/api/logs',route(async(req,res)=>res.json(await service.botLogs(req.query))));
  app.post('/admin/api/users/:id/items',route(async(req,res)=>res.status(201).json({rows:await service.grantItem(req.params.id,req.body,req.admin.username)})));
  app.post('/admin/api/users/:id/owned/:resource',route(async(req,res)=>res.status(201).json({row:await service.createOwned(req.params.resource,req.params.id,req.body,req.admin.username)})));
  app.get('/admin/api/records/:resource',route(async(req,res)=>res.json(await service.list(req.params.resource,req.query))));
  app.get('/admin/api/records/:resource/:id',route(async(req,res)=>res.json(await service.detail(req.params.resource,req.params.id))));
  app.patch('/admin/api/records/:resource/:id',route(async(req,res)=>res.json({row:await service.update(req.params.resource,req.params.id,req.body,req.admin.username)})));
  app.delete('/admin/api/records/:resource/:id',route(async(req,res)=>res.json(await service.remove(req.params.resource,req.params.id,req.body,req.admin.username))));
  app.use('/admin/api',(req,res)=>res.status(404).json({error:'Маршрут не найден'}));
  app.get('/admin/media',auth.guard,route(async(req,res)=>{const file=await resolveMedia(req.query.src);res.set('Cache-Control','private, max-age=60');res.sendFile(file);}));
  const publicDir=path.join(path.dirname(fileURLToPath(import.meta.url)),'public');
  app.get('/admin',(req,res)=>res.redirect(302,'/admin/'));
  app.use('/admin/',express.static(publicDir,{index:'index.html',dotfiles:'deny',fallthrough:true}));
  app.use((req,res)=>res.status(404).json({error:'Не найдено'}));
  app.use((error,req,res,next)=>{
    if(res.headersSent)return next(error);
    if(error.type==='entity.parse.failed')return res.status(400).json({error:'Некорректный JSON'});
    if(error.type==='entity.too.large')return res.status(413).json({error:'Слишком большой запрос'});
    if(error.name==='SequelizeUniqueConstraintError')return res.status(409).json({error:'Такое значение уже занято другой записью'});
    if(error instanceof AdminError)return res.status(error.status).json({error:error.message});
    console.error('Admin request failed:',error.message);res.status(500).json({error:'Не удалось выполнить операцию. Изменения не сохранены.'});
  });
  return {app,close:auth.close};
}
