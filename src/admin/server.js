import dotenv from 'dotenv';
dotenv.config({path:'.env.admin'});
dotenv.config({path:'.env.prod'});
const [{default:sequelize},{default:redis},{AdminAudit},{createAdminApp}]=await Promise.all([import('../db/config.js'),import('../services/redis-service.js'),import('./audit-model.js'),import('./app.js')]);
await sequelize.authenticate();
const {prepareAdminSchema}=await import('./schema.js');
await prepareAdminSchema();
await AdminAudit.sync();
const {syncGameLogs}=await import('../services/game-log-model.js');
await syncGameLogs();
const {installGameLogHooks}=await import('../services/game-log-service.js');
installGameLogHooks();
await redis.connect();
const {app,close}=createAdminApp({username:process.env.ADMIN_USERNAME,password:process.env.ADMIN_PASSWORD,secure:process.env.NODE_ENV==='production'});
const port=Number(process.env.ADMIN_PORT||3091);
const server=app.listen(port,'127.0.0.1',()=>console.log('Admin listening on 127.0.0.1:'+port));
async function shutdown(){close();server.close(async()=>{await sequelize.close();await redis.disconnect();process.exit(0);});setTimeout(()=>process.exit(1),10000).unref();}
process.once('SIGTERM',shutdown);process.once('SIGINT',shutdown);
