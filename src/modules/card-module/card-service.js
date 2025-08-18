import { Key, Keyboard } from "telegram-keyboard";
import { getUser } from "../../db/functions.js";
import { Card, User } from "../../db/models.js";
import { getRandomInt, separateNumber } from "../../utils/helpers.js";
import { getMineInfo } from "../mine-module/mine-service.js";

const getInventory = async (user, ctx) => {
  const cards = await Card.findAll({ where: { userId: user.id } });

  if (!cards.length) {
    return ctx.reply("У вас нет видеокарт");
  }
  const message = cards
    .map((card) => `• Видеокарта[<code>${card.id}</code>](+${card.lvl})`)
    .join("\n");

  return ctx.replyWithHTML(`Твой инвентарь:\n\n${message}`);
};

const deleteCard = async (user, cardId) => {
  const card = await Card.findOne({ where: { id: cardId, userId: user.id } });

  if (!card) {
    return "У тебя нет такой видеокарты😥";
  }

  await card.destroy();
  return `Успешно удалена Видеокарта[<code>${card.id}</code>]`;
};

const giveCard = async (sender, cardId, ctx) => {
  try {
    const message = ctx.message.reply_to_message;

    if (!message) return;

    const receiverChatId = message.from.id;

    if (message.from.is_bot) {
      await ctx.reply("Зачем боту видеокарты?🧐");
      return;
    }

    const receiver = await getUser(receiverChatId);

    if (!receiver) {
      await ctx.reply("Пользователь не зарегистрирован");
      return;
    }

    const card = await Card.findOne({
      where: {
        id: cardId,
        userId: sender.id,
      },
    });

    if (!card) {
      await ctx.reply("У тебя нет такой видеокарты 😥");
      return;
    }

    if (sender.id === receiver.id) {
      await ctx.reply("Иди нахуй, так нельзя🖕");
      return;
    }

    card.userId = receiver.id;

    await sender.save();
    await receiver.save();
    await card.save();

    await ctx.reply(
      `Ты передал(а) Видеокарта[${card.id}](${card.lvl}) <a href="tg://user?id=${receiver.chatId}">${receiver.firstname}</a>`,
      { parse_mode: "HTML" }
    );
  } catch (error) {
    console.log("Ошибка при передаче карты:", error);
    await ctx.reply("❌ Ошибка при передаче карты");
  }
};

const buyCard = async (user) => {
  const price = 15000;

  if (user.gems < price) {
    return "Недостаточно гемов🥲";
  }

  const count = await getMineInfo();

  if (count.cards <= 0) {
    return "Видеокарты закончились🥲";
  }

  count.cards -= 1;
  await count.save();

  const newCard = await Card.create({
    userId: user.id,
    lvl: 0,
    fuel: 0,
    balance: 0,
  });

  user.gems -= price;
  await user.save();

  return `Ты купил(а): Видеокарта[${newCard.id}]`;
};

const sellCard = async (user, id, price, replyMessage, ctx) => {
  try {
    if (price < 100) {
      return `Минимальная цена продажи 100 старок⭐️`;
    }

    const item = await Card.findOne({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!item) {
      return `У тебя нет такой видеокарты😥`;
    }

    if (replyMessage.isBot) {
      return `Нельзя продавать видеокарты ботам😥`;
    }

    const receiver = await getUser(replyMessage.id);

    if (receiver.id === user.id) {
      return `Нельзя продавать самому себе😥`;
    }

    if (receiver.balance < price) {
      return `У юзера недостаточно старок😥`;
    }

    await ctx.telegram.sendMessage(
      receiver.chatId,
      `${user.firstname} хочет продать тебе Видеокарту[${item.id}](+${
        item.lvl
      }) за ${separateNumber(price)} старок`,
      Keyboard.inline([
        [
          Key.callback(
            "Принять",
            `card_buy ${item.id} ${user.chatId} ${receiver.chatId} ${price}`
          ),
        ],
        [Key.callback("Отмена", "cancel")],
      ]),
      { parse_mode: "HTML" }
    );

    return `Предложение о покупке Видеокарты[${item.id}] за ${separateNumber(
      price
    )} старок было отправлено `;
  } catch (error) {
    console.log(error);
    return `Что-то пошло не так, возможно ${replyMessage.first_name} заблокировал меня в лс`;
  }
};

const upgradeCard = async (user, itemId) => {
  try {
    const hasCard = await Card.findOne({
      where: {
        userId: user.id,
        id: itemId,
      },
    });

    if (!hasCard) {
      return "У тебя нет этой видеокарты 😥";
    }

    if (user.oil === 0) {
      return "У тебя не достаточно смазок для видеокарты 😥";
    }

    if (hasCard.lvl === 10) {
      return "Эта видеокарта уже максимального уровня 💪";
    }

    const chance = getRandomInt(0, 100);

    let percent = 100 - (hasCard.lvl + 1) * 10;

    if (hasCard.lvl === 9) {
      percent = 1;
    }

    if (hasCard.lvl === 0) {
      percent = 90;
    }

    if (chance <= percent) {
      hasCard.lvl += 1;
      await hasCard.save();

      user.oil -= 1;
      await user.save();

      return `Ты успешно улучшил Видеокарта[${hasCard.id}] до ${hasCard.lvl} уровня 🎉`;
    } else {
      user.oil -= 1;
      await user.save();

      return "Ты не смог улучшить видеокарту, смазка утеряна 😥";
    }
  } catch (error) {
    console.log(error);
  }
};

export { getInventory, deleteCard, giveCard, buyCard, sellCard, upgradeCard };
