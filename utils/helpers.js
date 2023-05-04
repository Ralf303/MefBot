function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateCapcha() {
  let length = 6,
    charset = "1234567890";
  res = "";

  for (let i = 0, n = charset.length; i < length; i++) {
    res += charset.charAt(Math.floor(Math.random() * n));
  }

  return res;
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  let timeOutput = "";

  if (hours > 0) {
    timeOutput += `${hours} часов `;
  }

  if (minutes > 0) {
    timeOutput += `${minutes} минут `;
  }

  timeOutput += `${remainingSeconds} секунд`;

  return timeOutput.trim();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkUserSub(ctx, channel, trigger, msg, triggers, bot) {
  const chatMember = await bot.telegram.getChatMember(channel, ctx.from.id);
  const status = chatMember.status;
  NeedResult = ["member", "administrator", "creator"];
  if (
    NeedResult.includes(status) &&
    (triggers.includes(trigger) || triggers.includes(msg))
  ) {
    return true;
  } else {
    return false;
  }
}

function notify(ctx, channel) {
  ctx.reply(
    "Для того чтобы пользоваться ботом необходимо подписаться на канал @" +
      channel
  );
}

module.exports = {
  getRandomInt,
  generateCapcha,
  sleep,
  formatTime,
  notify,
  checkUserSub,
};
