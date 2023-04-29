const { Telegraf } = require('telegraf')
const { Extra, Markup, Stage, session } = Telegraf
const rateLimit = require('telegraf-ratelimit')
const { Keyboard, Key } = require('telegram-keyboard')
const { getRandomInt, generateCapcha, sleep, formatTime, notify, checkUserSub } = require('./utils/helpers.js')
const { dice, bandit } = require('./utils/games.js')
const token = '5790752465:AAHo8YTsyn0CWouPDpURS8jeivKikuF3XtA'
const bot = new Telegraf(token)
const { folderLoader } = require('telegraf-tools')(bot)
folderLoader('src')
const commands = 'Список команд:\nмеф гайд\nмеф\nбот\nкапча\nмагазин\nпроф\nкоманды'
const work = 'Команды на котором можно заработать мефа:\nФерма\nКуб\nБандит\n\nТак же в чате иногда появляется капча из 6 цифр и если вы введете ее правильно то получите мефа'
let capture = 120394857653
const triggers = ['меф', 'бот', 'капча', 'магазин', 'проф', 'команды', 'мой меф', 'б', 'куб', 'бандит', 'меф гайд']
let persone = {
    balance: 1000000,
    captureCounter: 0,
    farmtime: 0,
    meflvl: 1,
    timelvl: 1,
    words: 0,
  }
  let banditStatus = true

  bot.use(rateLimit({
    window: 4000,
    limit: 5,
  }))

  setInterval(() => {
    if (!banditStatus) {
      banditStatus = true
    }
  }, 5 * 1000)

  bot.command('command', (ctx) => {
    ctx.reply(commands)
  })

bot.on('text', async(ctx) => {
    const userMessage = ctx.message.text.toLowerCase()
    const [word1, word2, word3] = userMessage.split(' ')
    const replyToMessage = ctx.message.reply_to_message
    const checkStatus = await checkUserSub(ctx, '@healthy_food_music', word1, triggers, bot)
    try {
      if(checkStatus || userMessage === capture){

      if (userMessage == 'проф') {
        ctx.reply('Ваш ник: ' + ctx.from.first_name + '\nВаш ID: ' + ctx.chat.id + '\nВаш меф: ' + persone.balance + '\nКапчей введено: ' + persone.captureCounter + '\nВаш уровень сбора: ' + persone.meflvl + '\nВаш уровень времени: ' + persone.timelvl)
      }
      
      if (userMessage == 'мой меф' || userMessage == 'меф' || userMessage == 'б') {
          ctx.reply('Ваш меф: ' + persone.balance)
      }
      
      if (userMessage == 'капча') {
        capture = generateCapcha()
          ctx.reply('МефКапча ' + capture)
      }

      if (userMessage == 'меф гайд') {
        ctx.reply(work)
    }

      if (userMessage == 'бот') {
          ctx.reply('✅На месте')
      }
  
      if (userMessage == 'команды') {
          ctx.reply(commands)
      } 
      
      if (userMessage == 'магазин') {
          if (ctx.chat.type === 'private') {
            ctx.reply('Выберите что хотите купить:', Keyboard.make([
              [Key.callback('Товары для чата', 'chatAssortiment'), Key.callback('Улучшения', 'farmApp')],
              [Key.callback('Закрыть', 'dell')],
          ]).inline())
          } else if (ctx.chat.type === 'group' || ctx.chat.type === 'supergroup') {
            ctx.reply('Данная команда доступна только в лс')
          }
      }

      if (userMessage === capture) {
          const randommef = getRandomInt(50, 200)
          persone.balance += randommef
          await ctx.reply("Верно, ты получил " + randommef + " мефа", {
            reply_to_message_id:
            ctx.message.message_id,
          })
          capture = 342234242
      }

      if (word1 == 'куб') {
        await dice(word3, word2, persone, bot, ctx)
      }

      if (word1 == 'бандит') {
        

        await bandit(word2, persone, ctx, banditStatus)
        banditStatus = false
        
      }
    } else if(triggers.includes(userMessage)) {
      notify(ctx, 'healthy_food_music')
    }

    } catch (e) {
      ctx.reply('Какая то ошибка, ' + e)      
    }
})


bot.launch()