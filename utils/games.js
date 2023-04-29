const { sleep } = require('./helpers.js')

async function dice(word3, word2, persone, bot, ctx) {
    const stake = Number(word2)
  const userInput = word3
  if (userInput !== undefined && persone.balance >= stake && stake) {
    persone.balance -= stake
      const info = await bot.telegram.sendDice(ctx.chat.id)
    await sleep(3800)
    const dice = info.dice.value
 
    if (Number(userInput) >= 1 && Number(userInput) <= 6) {
    if (Number(userInput) === dice) {
      ctx.reply(`Поздравляем! Кубик показал ${dice}\n Выйгрыш ${stake * 10}`)
      persone.balance += stake*10
    } else {
      ctx.reply(`К сожалению, вы проиграли. Кубик показал ${dice}`)
    }
  } else if (userInput === 'чет' || userInput === 'нечет') {
    const isEven = dice % 2 === 0
    if ((isEven && userInput === 'чет') || (!isEven && userInput === 'нечет')) {
      ctx.reply(`Поздравляем! Кубик показал ${dice} (число ${isEven ? "чётное" : "нечётное"})\n Выйгрыш ${stake * 1.5}`)
      persone.balance += stake*1.5
    } else {
      ctx.reply(`К сожалению, вы проиграли. Кубик показал ${dice} (число ${isEven ? "четное" : "нечетное"})`)
    }
  }
} else if (stake > persone.balance) {
  ctx.reply('Не достаточно мефа😢')
} else {
    ctx.reply('Введите ставку, а дальше число от 1 до 6, "чет" или "нечет", например "куб 1000 5" или "куб 228 нечет"')
  }
}

async function bandit(word2, persone, ctx, banditStatus) {
    const fruits = ['🍇', '🍊', '🍐', '🍋', '🍒', '🍓', '🍑', '🍉', '🍌', '🍍']

    try {
        let stake = Number(word2)
        if (stake > 99 && persone.balance >= stake && stake && banditStatus) {
          persone.balance -= stake
        const randEmoji = () => fruits[Math.floor(Math.random() * fruits.length)];
        const randomEmojis = [randEmoji(), randEmoji(), randEmoji()];
      
        let msg;
        let i = 0;
        const interval = setInterval(async () => {
          try{
          if (msg) {
            await ctx.telegram.editMessageText(msg.chat.id, msg.message_id, null, `[${randomEmojis.slice(0, i).join('|')}${' '.repeat(3 - i)}]`);
          } else {
            msg = await ctx.reply('[   ]');
          }
        } catch(e){
          console.log(e)
        }
          i++;
          try {
            if (i > 3) {
            clearInterval(interval);
            if (randomEmojis.every(e => e === randomEmojis[0])) {
              persone.balance += stake*20
              msg = await ctx.telegram.editMessageText(
                msg.chat.id,
                msg.message_id,
                null,
                `${randomEmojis.join('|')}\n @${ctx.from.username} выйгрыш ${stake*20}!`);
                
            } else if (randomEmojis[0] === randomEmojis[1] || randomEmojis[0] === randomEmojis[2] || randomEmojis[1] === randomEmojis[2]) {
              persone.balance += stake*5
              msg = await ctx.telegram.editMessageText(
                msg.chat.id,
                msg.message_id,
                null,
                `${randomEmojis.join('|')}\n @${ctx.from.username} выйгрыш ${stake*5}!`)
                
            } else {
              msg = await ctx.telegram.editMessageText(
                msg.chat.id,
                msg.message_id,
                null,
                `${randomEmojis.join('|')}\n @${ctx.from.username} выйгрыш ${0}!`
              );
              
            }
          
          } } catch(e){console.log(e)}
        }, 500);
        } else if (stake > persone.balance) {
          ctx.reply('Недостаточно мефа😢')
        }  else if (!banditStatus) {
            return
        } else {
          ctx.reply('Введи "бандит [ставка]" больше 100')
        }} catch(e) {
          console.log('Бот лег но все работает)');
        }
}

module.exports = { dice, bandit }