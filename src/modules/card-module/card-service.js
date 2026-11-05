import { ALL } from "../../utils/transfer-amount.js";
import { escapeTransferText, getTransferRecipient, transferRecipientLink } from "../../utils/transfer-recipient.js";
import { assetSnapshot, CHANGED_TRANSFER, requestFullTransfer } from "../../services/transfer-confirmation.js";
import {noteLog,currentLogContext} from '../../services/game-log-service.js';
import jwtService from "../../services/jwt-service.js";
import { withUserTransaction, withUsersTransaction } from "../../services/transaction-service.js";
import { Key, Keyboard } from "telegram-keyboard";
import { getUser } from "../../db/functions.js";
import { Card, CardStand } from "../../db/models.js";
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

  return ctx.replyWithHTML(`Твой инвентарь:\n\n${message}\n\n📖Передать видеокарту [ID или всё]`);
};

const deleteCardUnsafe = async (user, cardId) => {
  const card = await Card.findOne({ where: { id: cardId, userId: user.id } });

  if (!card) {
    return "У тебя нет такой видеокарты😥";
  }

  await card.destroy();
  return `Успешно удалена Видеокарта[<code>${card.id}</code>]`;
};

const giveCard = async (sender, cardId, ctx, confirmed) => {
  const target = confirmed?.target ?? await getTransferRecipient(ctx, cardId === ALL ? { registeredOnly: true } : undefined);
  if (!target) return;
  const { receiver } = target;
  const result = await withUsersTransaction([sender, receiver], async ([from, to], transaction) => {
    const where = { userId: from.id, ...(cardId === ALL ? {} : { id: cardId }) };
    const assets = await Card.findAll({ where, transaction, lock: transaction.LOCK.UPDATE });
    const snapshot = cardId === ALL ? assetSnapshot(assets) : null;
    if (confirmed && snapshot !== confirmed.data.snapshot) return { error: CHANGED_TRANSFER };
    if (!assets.length || (cardId === ALL && !confirmed)) return { cards: assets, snapshot };

    await CardStand.update({ cardId: null }, { where: { cardId: assets.map(({ id }) => id) }, transaction });
    await Card.update({ userId: to.id }, { where, transaction });
    return { cards: assets };
  });

  if (result.error) return ctx.reply(result.error);
  const { cards } = result;
  if (!cards.length) return ctx.reply(cardId === ALL ? "У тебя нет видеокарт." : "У тебя нет такой видеокарты.");
  const description = cardId === ALL ? `все видеокарты (${cards.length} шт.)` : `Видеокарта[${cards[0].id}](${cards[0].lvl})`;
  if (cardId === ALL && !confirmed) return requestFullTransfer(ctx, sender, target, "cards", { snapshot: result.snapshot }, description);
  return ctx.replyWithHTML(`Ты передал(а) ${escapeTransferText(description)} ${transferRecipientLink(receiver)}`);
};

const buyCardUnsafe = async (user, transaction) => {
  const price = 15000;

  if (user.gems < price) {
    return "Недостаточно гемов🥲";
  }

  const count = await getMineInfo();
  await count.reload({ transaction, lock: transaction.LOCK.UPDATE });

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
            jwtService.generateTradeToken("card", { id: item.id, senderId: user.chatId, receiverId: receiver.chatId, price })
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

const upgradeCardUnsafe = async (user, itemId) => {
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
    throw error;
  }
};

const deleteCard = (user, id) => withUserTransaction(user, (locked) => deleteCardUnsafe(locked, id));
const buyCard = (user) => withUserTransaction(user, (locked, transaction) => buyCardUnsafe(locked, transaction));
const upgradeCard = (user, ...args) => withUserTransaction(user, async (locked) => {const before=locked.oil,result=await upgradeCardUnsafe(locked,...args);if(currentLogContext()&&locked.oil<before)await noteLog('card.change',{cardId:args[0],success:result.includes('успешно'),result},[user]);return result;});
export { getInventory, deleteCard, giveCard, buyCard, sellCard, upgradeCard };
