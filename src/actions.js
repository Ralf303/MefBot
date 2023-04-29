const { Keyboard, Key } = require('telegram-keyboard')

module.exports = (bot) => {
    trigerToBuy = {
        "buy1": {
            name: 'ВИП',
            prise: 100000,
        }
    }

    function buyAction(ctx, prise) {
        
    }
   /* bot.action('buy1', (ctx) => {
        ctx.deleteMessage()
        if (ctx.user.val >= 100000) {
          ctx.reply('Поздравляем с покупкой!\n\nОжидайте, вскоре администратор вам все выдаст')
          ctx.user.val -= 100000
          bot.telegram.sendMessage('1157591765', 'Заявка на покупку!\n\nИмя покупателя @' + ctx.chat.username + '\n\nТовар: ВИП')
        } else {
          ctx.reply('Не достаточно мефа😢')
        }
      })

      bot.action('buy2', (ctx) => {
        ctx.deleteMessage()
        if (ctx.user.val >= 80000) {
          ctx.reply('Поздравляем с покупкой!\n\nОжидайте, вскоре администратор вам все выдаст')
          ctx.user.val -= 80000
          bot.telegram.sendMessage('1157591765', 'Заявка на покупку!\n\nИмя покупателя @' + ctx.chat.username + '\n\nТовар: Админка')
        } else {
          ctx.reply('Не достаточно мефа😢')
        }
      }) 
      */

      bot.action('dell', (ctx) => {
        ctx.deleteMessage()
      })

      bot.action('chatAssortiment', (ctx) =>{
        ctx.deleteMessage()
        ctx.reply('Товары📦\n•ВИП статус в ирисе: 100к💰\n•+1лвл админа: 80к💰\n•Префикс: 40к💰\n•Снять варн: 20к💰\n•Купить анонимность: 150к💰\n•Доступ к логам: 25к💰\n•Смена префикса: 10к💰\n•Снять бан: 100к💰\n•Выход из ЧС: 200к💰\n\n❗️магазин не доступен 3+ рангам администраторов❗️',  Keyboard.make([
              [Key.callback('ВИП', 'vip'), Key.callback('Админка', 'adm'), Key.callback('Префикс', 'pref')],
              [Key.callback('Снять Варн', 'warn'), Key.callback('Анон', 'anon'), Key.callback('Логи', 'logi')],
              [Key.callback('Смен преф', 'change'), Key.callback('Снять бан', 'ban'), Key.callback('Выход ЧС', 'chs')],
              [Key.callback('Закрыть', 'dell'), Key.callback('Назад', 'menu')],
            ]).inline())
        })

        bot.action('menu', (ctx) =>{
            ctx.deleteMessage()
            ctx.reply('Выберите что хотите купить:', Keyboard.make([
                [Key.callback('Товары для чата', 'chatAssortiment'), Key.callback('Улучшения', 'farmApp')],
                [Key.callback('Закрыть', 'dell')],
            ]).inline())
        })
    }