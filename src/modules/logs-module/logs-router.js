import {Composer} from 'telegraf';
import {noteLog,currentLogContext} from '../../services/game-log-service.js';
const router=new Composer();
router.on('text',async(ctx,next)=>{
  const command=ctx.message.text.trim().toLowerCase(),target=ctx.message.reply_to_message?.from;
  if(target&&/^(мут|варн|пред|бан|размут|говори|разварн|разбан|снять (мут|варн|бан))(\s|$)/.test(command)){
    if(currentLogContext())currentLogContext().status='observed';
    await noteLog('moderation.command',{command:command.split(/\s+/).slice(0,2).join(' '),targetTelegramId:String(target.id),messageId:ctx.message.message_id},[{chatId:target.id}]);
  }
  return next();
});
export default router;
