import { Composer } from "telegraf";
import ru_text from "../../../ru_text.js";
import {
  getFamilyByUserId,
  getRang,
  addUserToFamily,
  getMainUser,
  getDeputies,
  removeUserFromFamily,
  getFamilyByFamId,
  setRang,
  getBufsText,
  getTopFams,
  getFamilyMembers,
} from "./fam-service.js";
import { Keyboard, Key } from "telegram-keyboard";
import {
  checkUserById,
  checkUserByUsername,
  getUser,
} from "../../db/functions.js";
import redisService from "../../services/redis-service.js";
import { resolveReceiver, separateNumber } from "../../utils/helpers.js";

const famModule = new Composer();

const parseChatIdArgument = (argument) => {
  if (!argument) return null;

  const text = argument.trim();

  const openMessageMatch = text.match(/^tg:\/\/openmessage\?user_id=(\d+)$/i);
  if (openMessageMatch) return openMessageMatch[1];

  const prefixedIdMatch = text.match(/^id(\d+)$/i);
  if (prefixedIdMatch) return prefixedIdMatch[1];

  const plainIdMatch = text.match(/^@?(\d+)$/);
  if (plainIdMatch) return plainIdMatch[1];

  return null;
};

const resolveFamilyTargetUser = async (ctx) => {
  const replyMessage = ctx.message.reply_to_message;
  if (replyMessage) {
    return {
      chatId: String(replyMessage.from.id),
      firstname: replyMessage.from.first_name || "Пользователь",
    };
  }

  const argument = ctx.message.text.split(" ")[2];
  if (!argument) {
    return { error: "NO_TARGET" };
  }

  const chatId = parseChatIdArgument(argument);
  if (chatId) {
    const userById = await checkUserById(chatId);
    if (!userById) return { error: "NOT_FOUND" };

    return {
      chatId: String(userById.chatId),
      firstname: userById.firstname || "Пользователь",
    };
  }

  if (argument.startsWith("@")) {
    const userByUsername = await checkUserByUsername(argument.slice(1));
    if (!userByUsername) return { error: "NOT_FOUND" };

    return {
      chatId: String(userByUsername.chatId),
      firstname: userByUsername.firstname || "Пользователь",
    };
  }

  return { error: "INVALID_TARGET" };
};

famModule.hears(/^семья$/i, async (ctx, next) => {
  try {
    await ctx.reply(ru_text.family);

    return next();
  } catch (error) {
    console.log(error);
  }
});

famModule.hears(/^моя семья$/i, async (ctx, next) => {
  try {
    const fam = await getFamilyByUserId(ctx.from.id);

    if (!fam) return await ctx.reply("У тебя нет семьи 😢");
    const rang = await getRang(ctx.from.id, fam.id);
    const mainUser = await getMainUser(fam.id);
    const zams = await getDeputies(fam.id);
    let zam1 = "нет";
    let zam2 = "нет";

    if (zams.length > 0) {
      zam1 = await getUser(zams[0].userId);
      zam1 = `<a href="tg://openmessage?user_id=${zam1.chatId}">${zam1.firstname}</a>`;
    }

    if (zams.length > 1) {
      zam2 = await getUser(zams[1].userId);
      zam2 = `<a href="tg://openmessage?user_id=${zam2.chatId}">${zam2.firstname}</a>`;
    }

    await ctx.reply(
      `⚔️ [${fam.id}] Семья «${
        fam.name
      }»\n\n🔅 Лидер: <a href="tg://openmessage?user_id=${mainUser.chatId}">${
        mainUser.firstname
      }</a>\n🔅 Зам: ${zam1}\n🔅 Зам: ${zam2}\n💼 Твой ранг: ${rang}\n☢️ Репутация: ${
        fam.reputation
      }\n${fam.check ? "✅" : "❌"} Галочка: ${
        fam.check ? "есть" : "нет"
      }\n💰 Процент фермы: ${fam.percent}%\n⭐️ Старки: ${separateNumber(
        fam.mef
      )}\n🪙 Монеты: ${separateNumber(fam.balance)}\n👥 Участников: ${
        fam.fullSlots
      }\n🏠 Макс. Участников: ${fam.slots}\n\nОписание: ${fam.description}`,
      {
        parse_mode: "HTML",
        disable_notification: true,
      }
    );

    return next();
  } catch (error) {
    console.log(error);
  }
});

famModule.hears(/^создать семью$/i, async (ctx, next) => {
  try {
    const fam = await getFamilyByUserId(ctx.from.id);

    if (fam) return await ctx.reply("У тебя и так уже есть семья 😳");

    if (ctx.chat.type !== "private")
      return await ctx.reply("Создать семью можно только в лс");

    await ctx.reply(
      ru_text.buy_fam,
      Keyboard.inline([
        [Key.callback("✅ Точно купить ✅", "fam" + ctx.from.id)],
      ])
    );

    return next();
  } catch (error) {
    console.log(error);
  }
});

famModule.hears(/^семья описание.*$/i, async (ctx, next) => {
  try {
    const description = ctx.message.text.slice(15);

    if (description.length > 50)
      return await ctx.reply(
        "Слишком длинное описание (должно быть не длиннее 50 символов)"
      );

    const fam = await getFamilyByUserId(ctx.from.id);
    if (!fam) return await ctx.reply("У тебя нет семьи 😢");
    const rang = await getRang(ctx.from.id, fam.id);
    if (rang != 5)
      return await ctx.reply("Только основатель может менять описание 👑");

    fam.description = description;
    await fam.save();
    await ctx.reply("Отлично, описание семьи успешно обновлено");
    return next();
  } catch (error) {
    console.log(error);
  }
});

famModule.hears(/^семья процент.*$/i, async (ctx, next) => {
  try {
    const percent = Number(ctx.message.text.slice(14));
    if (isNaN(percent) || percent > 20 || percent < 0)
      return await ctx.reply("Введи число от 0 до 20");
    const fam = await getFamilyByUserId(ctx.from.id);
    if (!fam) return await ctx.reply("У тебя нет семьи 😢");
    const rang = await getRang(ctx.from.id, fam.id);
    if (rang != 5)
      return await ctx.reply(
        "Только основатель может менять процент, который удерживается со сбора фермы 👑"
      );

    fam.percent = percent;
    await fam.save();
    await ctx.reply(
      `Отлично, теперь коммисия, которая удерживается со сбора фермы, равняется ${percent}%`
    );
    return next();
  } catch (error) {
    console.log(error);
  }
});

famModule.hears(/^семья снять стар.*$/i, async (ctx, next) => {
  try {
    const amountText = ctx.message.text.split(" ")[3];
    const fam = await getFamilyByUserId(ctx.from.id);
    if (!fam) return await ctx.reply("У тебя нет семьи 😢");
    const rang = await getRang(ctx.from.id, fam.id);
    if (rang != 5)
      return await ctx.reply("Только основатель может снимать старки 👑");

    let ammount;
    if (
      amountText.toLowerCase() === "все" ||
      amountText.toLowerCase() === "всё"
    ) {
      ammount = fam.mef;
    } else {
      ammount = Number(amountText);
      if (isNaN(ammount) || ammount <= 0)
        return await ctx.reply("Введи число больше 0");
    }

    if (fam.mef < ammount)
      return await ctx.reply("В семье нет столько старок 😢");

    ctx.state.user.balance += ammount;
    fam.mef -= ammount;
    await fam.save();
    await ctx.reply(`Ты успешно снял ${separateNumber(ammount)} старок ⭐️`);
    return next();
  } catch (error) {
    console.log(error);
  }
});

famModule.hears(/^семья снять монеты.*$/i, async (ctx, next) => {
  try {
    const amountText = ctx.message.text.split(" ")[3];
    const fam = await getFamilyByUserId(ctx.from.id);
    if (!fam) return await ctx.reply("У тебя нет семьи 😢");
    const rang = await getRang(ctx.from.id, fam.id);
    if (rang != 5)
      return await ctx.reply("Только основатель может снимать монеты 👑");

    let ammount;
    if (
      amountText.toLowerCase() === "все" ||
      amountText.toLowerCase() === "всё"
    ) {
      ammount = fam.balance;
    } else {
      ammount = Number(amountText);
      if (isNaN(ammount) || ammount <= 0)
        return await ctx.reply("Введи число больше 0");
    }

    if (fam.balance < ammount)
      return await ctx.reply("В семье нет столько монет 😢");

    ctx.state.user.famMoney += ammount;
    fam.balance -= ammount;
    await fam.save();
    await ctx.reply(`Ты успешно снял ${separateNumber(ammount)} монет 🪙`);
    return next();
  } catch (error) {
    console.log(error);
  }
});

famModule.hears(/^семья галочка/i, async (ctx) => {
  try {
    const fam = await getFamilyByUserId(ctx.from.id);
    await ctx.reply(
      `${
        fam.check
          ? `У семьи уже есть галочка ✅`
          : "У семьи нет галочки, ты ее можешь купить за 10.000.000 старок\n\nЗачем галочка?\n\n• 2х репутация.\n\n• Каждый час, все участники семьи получают семейные монеты в зависимости от ранга(5 ранг 5 монет, 4 ранг 4 монеты и так далее).\n\n• +10 слотов единовременно.\n\n\n📖 Семья купить галочку"
      }`
    );
  } catch (error) {
    console.log(error);
  }
});

famModule.hears(/^семья купить галочку/i, async (ctx, next) => {
  try {
    const fam = await getFamilyByUserId(ctx.from.id);
    if (!fam) return await ctx.reply("У тебя нет семьи 😢");
    if (fam.check) return await ctx.reply("У твоей семьи уже есть галочка ✅");
    await ctx.reply(
      ru_text.buy_check,
      Keyboard.inline([[Key.callback("Точно купить", "check" + ctx.from.id)]])
    );

    return next();
  } catch (error) {
    console.log(error);
  }
});

famModule.hears(/^семья пригласить/i, async (ctx, next) => {
  try {
    const fam = await getFamilyByUserId(ctx.from.id);
    if (!fam) return await ctx.reply("У тебя нет семьи 😢");
    const rang = await getRang(ctx.from.id, fam.id);
    if (rang < 4)
      return await ctx.reply(
        "Только основатель или замы могут приглашать в семью 😢"
      );

    const target = await resolveFamilyTargetUser(ctx);
    if (target.error === "NO_TARGET") {
      return await ctx.reply(
        "Укажи пользователя, которого хочешь пригласить в семью"
      );
    }

    if (target.error === "NOT_FOUND") {
      return await ctx.reply("Пользователь не найден 😢");
    }

    if (target.error === "INVALID_TARGET") {
      return await ctx.reply(
        "Укажи @username или chat id (пример: @7060305917 / 7060305917 / tg://openmessage?user_id=7060305917 / id7060305917)"
      );
    }

    const userFam = await getFamilyByUserId(target.chatId);
    if (userFam) return await ctx.reply("У этого пользователя уже есть семья");
    const isInvaited = await redisService.get(`invite:${target.chatId}`);
    if (isInvaited)
      return await ctx.reply("Юзеру уже отправляли заявку, попробуй позже");

    await ctx.telegram
      .sendMessage(
        target.chatId,
        `Семья «${fam.name}» хочет видеть в рядах своих родственников\n\nВведи:\n📖<code>Семья принять</code>\n📖<code>Семья отклонить</code>`,
        { parse_mode: "HTML" }
      )
      .catch(async () => {
        return await ctx.reply(
          `<a href="tg://openmessage?user_id=${target.chatId}">${target.firstname}</a> Семья «${fam.name}» хочет видеть в рядах своих родственников\n\nВведи:\n📖<code>Семья принять</code>\n📖<code>Семья отклонить</code>`,
          { parse_mode: "HTML" }
        );
      });

    await redisService.setInvite(target.chatId, fam.id);
    await ctx.reply("Заявка успешно отправлена ✅");

    return next();
  } catch (error) {
    console.log(error);
  }
});

famModule.hears(/^семья принять/i, async (ctx, next) => {
  try {
    const fam = await getFamilyByUserId(ctx.from.id);
    if (fam)
      return await ctx.reply("У тебя уже есть семья, зачем тебе вторая 🤔");
    const famId = await redisService.get(`invite:${ctx.from.id}`);
    if (!famId) return await ctx.reply("У тебя нет приглашений в семью 🥲");
    const newFam = await getFamilyByFamId(famId);
    if (newFam.fullSlots >= newFam.slots)
      return await ctx.reply("В семье недостаточно мест 🥲");
    await addUserToFamily(ctx.from.id, famId);
    newFam.fullSlots += 1;
    await redisService.delete(`invite:${ctx.from.id}`);
    await newFam.save();
    await ctx.reply(
      `Ты успешно принял приглашение!\n\nДобро пожаловать в «${newFam.name}»`
    );
    return next();
  } catch (error) {
    console.log(error);
  }
});

famModule.hears(/^семья отклонить/i, async (ctx, next) => {
  try {
    const famId = await redisService.get(`invite:${ctx.from.id}`);
    if (!famId) return await ctx.reply("У тебя нет приглашений в семью 🥲");
    await redisService.delete(`invite:${ctx.from.id}`);
    await ctx.reply("Ты успешно отклонил приглашение");
    return next();
  } catch (error) {
    console.log(error);
  }
});

famModule.hears(/^семья кик/i, async (ctx, next) => {
  try {
    const fam = await getFamilyByUserId(ctx.from.id);
    if (!fam) return await ctx.reply("У тебя нет семьи 😢");
    const rang = await getRang(ctx.from.id, fam.id);
    if (rang < 4)
      return await ctx.reply(
        "Только основатель или замы могут кикать из семьи 😢"
      );

    const target = await resolveFamilyTargetUser(ctx);
    if (target.error === "NO_TARGET") {
      return await ctx.reply(
        "Укажи пользователя, которого хочешь кикнуть из семьи"
      );
    }

    if (target.error === "NOT_FOUND") {
      return await ctx.reply("Пользователь не найден 😢");
    }

    if (target.error === "INVALID_TARGET") {
      return await ctx.reply(
        "Укажи @username или chat id (пример: @7060305917 / 7060305917 / tg://openmessage?user_id=7060305917 / id7060305917)"
      );
    }

    const userFam = await getFamilyByUserId(target.chatId);
    if (!userFam || userFam.id != fam.id)
      return await ctx.reply("Этот пользователь не из вашей семьи");

    const userRang = await getRang(target.chatId, fam.id);
    if (userRang > 3) {
      return await ctx.reply("5 или 4 ранги нельзя кикать ❌");
    }
    await removeUserFromFamily(target.chatId, fam.id);
    fam.fullSlots -= 1;
    await fam.save();
    await ctx.reply("Пользователь успешно кикнут из семьи ✅");

    return next();
  } catch (error) {
    console.log(error);
  }
});

famModule.hears(/^семья покинуть/i, async (ctx, next) => {
  try {
    const fam = await getFamilyByUserId(ctx.from.id);
    if (!fam) return await ctx.reply("У тебя нет семьи 😳");
    const rang = await getRang(ctx.from.id, fam.id);
    if (rang === 5)
      return await ctx.reply("Основатель не может бросить семью 😳");

    await removeUserFromFamily(ctx.from.id, fam.id);
    fam.fullSlots -= 1;
    await fam.save();
    await ctx.reply("Ты успешно покинул семью ✅");
    return next();
  } catch (error) {
    console.log(error);
  }
});

famModule.hears(/^семья повысить/i, async (ctx, next) => {
  try {
    const argument = ctx.message.text.split(" ")[2];
    const fam = await getFamilyByUserId(ctx.from.id);
    if (!fam) return await ctx.reply("У тебя нет семьи 😢");
    const rang = await getRang(ctx.from.id, fam.id);
    if (rang < 4)
      return await ctx.reply(
        "Только основатель или замы могут повышать ранг 😢"
      );

    if (ctx.message.reply_to_message) {
      const userChatId = ctx.message.reply_to_message.from.id;
      if (ctx.from.id === userChatId)
        return await ctx.reply("Ты не можешь повысить себя 😢");
      const userFam = await getFamilyByUserId(userChatId);
      if (!userFam || userFam.id != fam.id)
        return await ctx.reply("Этот пользователь не из вашей семьи 😳");

      const zams = await getDeputies(fam.id);
      const userRang = await getRang(userChatId, fam.id);
      if (userRang === 4) {
        return await ctx.reply(
          "Этот пользователь уже имеет максимальный ранг 👑"
        );
      }

      if (rang === 4 && userRang === 3) {
        return await ctx.reply(
          "Снимать и назначать заместителей может только основатель 😢"
        );
      }

      if (userRang === 3 && zams.length == 2) {
        return await ctx.reply("В семье могут быть только два зама 👑");
      }

      await setRang(userChatId, fam.id, userRang + 1);
      await ctx.reply("Пользователь успешно повышен 👑");
      return next();
    }

    if (argument.includes("@") && argument.length >= 5) {
      const user = await checkUserByUsername(argument.slice(1));
      if (!user)
        return await ctx.reply("Пользователя с таким именем не существует 😢");
      if (ctx.from.id == user.chatId)
        return await ctx.reply("Ты не можешь повысить себя 😢");
      const userFam = await getFamilyByUserId(user.chatId);
      if (!userFam || userFam.id != fam.id)
        return await ctx.reply("Этот пользователь не из вашей семьи 😳");

      const zams = await getDeputies(fam.id);
      const userRang = await getRang(user.chatId, fam.id);
      if (userRang === 4) {
        return await ctx.reply(
          "Этот пользователь уже имеет максимальный ранг 👑"
        );
      }

      if (rang === 4 && userRang === 3) {
        return await ctx.reply(
          "Снимать и назначать заместителей может только основатель 😢"
        );
      }

      if (userRang === 3 && zams.length == 2) {
        return await ctx.reply("В семье могут быть только два зама 👑");
      }

      await setRang(user.chatId, fam.id, userRang + 1);
      await ctx.reply("Пользователь успешно повышен 👑");
    }

    return next();
  } catch (error) {
    console.log(error);
  }
});

famModule.hears(/^семья понизить/i, async (ctx, next) => {
  try {
    const fam = await getFamilyByUserId(ctx.from.id);
    if (!fam) return await ctx.reply("У тебя нет семьи 😢");
    const rang = await getRang(ctx.from.id, fam.id);
    if (rang < 4)
      return await ctx.reply(
        "Только основатель или замы могут повышать ранг 😢"
      );

    const target = await resolveFamilyTargetUser(ctx);
    if (target.error === "NO_TARGET") {
      return await ctx.reply(
        "Укажи пользователя, которого хочешь понизить в ранге"
      );
    }

    if (target.error === "NOT_FOUND") {
      return await ctx.reply("Пользователь не найден 😢");
    }

    if (target.error === "INVALID_TARGET") {
      return await ctx.reply(
        "Укажи @username или chat id (пример: @7060305917 / 7060305917 / tg://openmessage?user_id=7060305917 / id7060305917)"
      );
    }

    if (ctx.from.id == target.chatId)
      return await ctx.reply("Ты не можешь понизить себя 😢");
    const userFam = await getFamilyByUserId(target.chatId);
    if (!userFam || userFam.id != fam.id)
      return await ctx.reply("Этот пользователь не из вашей семьи 😳");

    const userRang = await getRang(target.chatId, fam.id);
    if (userRang === 1) {
      return await ctx.reply("Этот пользователь и так минимального ранга 😢");
    }

    if (rang === 4 && userRang >= 4) {
      return await ctx.reply(
        "Снимать и назначать заместителей может только основатель 😢"
      );
    }
    await setRang(target.chatId, fam.id, userRang - 1);
    await ctx.reply("Пользователь успешно понижен ✅");

    return next();
  } catch (error) {
    console.log(error);
  }
});
famModule.hears(/^семья пополнить стар.*$/i, async (ctx, next) => {
  try {
    const amountText = ctx.message.text.split(" ")[3];
    const fam = await getFamilyByUserId(ctx.from.id);
    if (!fam) return await ctx.reply("У тебя нет семьи 😢");

    let ammount;
    if (
      amountText.toLowerCase() === "все" ||
      amountText.toLowerCase() === "всё"
    ) {
      ammount = ctx.state.user.balance;
    } else {
      ammount = Number(amountText);
      if (isNaN(ammount) || ammount <= 0)
        return await ctx.reply("Введи число больше 0");
    }

    if (ctx.state.user.balance < ammount)
      return await ctx.reply("У тебя нет столько старок 😢");

    ctx.state.user.balance -= ammount;
    fam.mef += ammount;
    await fam.save();
    await ctx.reply(
      `Ты успешно пополнил баланс семьи на ${separateNumber(
        ammount
      )} старок ⭐️`
    );
    return next();
  } catch (error) {
    console.log(error);
  }
});

famModule.hears(/^семья пополнить монеты.*$/i, async (ctx, next) => {
  try {
    const amountText = ctx.message.text.split(" ")[3];
    const fam = await getFamilyByUserId(ctx.from.id);
    if (!fam) return await ctx.reply("У тебя нет семьи 😢");

    let ammount;
    if (
      amountText.toLowerCase() === "все" ||
      amountText.toLowerCase() === "всё"
    ) {
      ammount = ctx.state.user.famMoney;
    } else {
      ammount = Number(amountText);
      if (isNaN(ammount) || ammount <= 0)
        return await ctx.reply("Введи число больше 0");
    }

    if (ctx.state.user.famMoney < ammount)
      return await ctx.reply("У тебя нет столько семейных монет 😢");

    ctx.state.user.famMoney -= ammount;
    fam.balance += ammount;
    await fam.save();
    await ctx.reply(
      `Ты успешно пополнил баланс семьи на ${separateNumber(
        ammount
      )} семейных монет 🪙`
    );
    return next();
  } catch (error) {
    console.log(error);
  }
});

famModule.hears(/^семья улучшения/i, async (ctx, next) => {
  try {
    const fam = await getFamilyByUserId(ctx.from.id);
    if (!fam) return await ctx.reply("У тебя нет семьи 😢");

    await ctx.reply(getBufsText(fam));

    return next();
  } catch (error) {
    console.log(error);
  }
});

famModule.hears(/^семья купить улучшение.*$/i, async (ctx, next) => {
  try {
    const ammount = Number(ctx.message.text.split(" ")[3]);
    const fam = await getFamilyByUserId(ctx.from.id);
    if (!fam) return await ctx.reply("У тебя нет семьи 😢");

    if (isNaN(ammount) || ammount <= 0 || ammount > 7)
      return await ctx.reply("Введи id улучшения");

    if (ctx.state.user.balance < 1000000)
      return await ctx.reply("У тебя нет столько старок 😢");

    ctx.state.user.balance -= 1000000;

    switch (ammount) {
      case 1:
        if (fam.Baf.active === 5)
          return await ctx.reply(
            "Это улучшение уже имеет максимальный уровень 💪"
          );

        fam.Baf.active += 1;
        await ctx.reply(
          `Готово, теперь участники семьи получают +${
            fam.Baf.active * 250
          } старок к награде за актив 🎉`
        );
        break;

      case 2:
        if (fam.Baf.luck === 5)
          return await ctx.reply(
            "Это улучшение уже имеет максимальный уровень 💪"
          );

        fam.Baf.luck += 1;
        await ctx.reply(
          `Готово, теперь участники семьи получают +${fam.Baf.luck} к удаче 🎉`
        );
        break;

      case 3:
        if (fam.Baf.craft === 5)
          return await ctx.reply(
            "Это улучшение уже имеет максимальный уровень 💪"
          );

        fam.Baf.craft += 1;
        await ctx.reply(
          `Готово, теперь участники семьи получают +${fam.Baf.craft}% к успешному крафту 🎉`
        );
        break;

      case 4:
        if (fam.Baf.farm === 5)
          return await ctx.reply(
            "Это улучшение уже имеет максимальный уровень 💪"
          );

        fam.Baf.farm += 1;
        await ctx.reply(
          `Готово, теперь участники семьи получают +${
            fam.Baf.farm * 100
          } старок к сбору фермы 🎉`
        );
        break;

      case 5:
        if (fam.Baf.capcha === 5)
          return await ctx.reply(
            "Это улучшение уже имеет максимальный уровень 💪"
          );

        fam.Baf.capcha += 1;
        await ctx.reply(
          `Готово, теперь участники семьи получают +${
            fam.Baf.capcha * 200
          } старок за ввод капчи 🎉`
        );
        break;

      case 6:
        if (fam.Baf.invite === 5)
          return await ctx.reply(
            "Это улучшение уже имеет максимальный уровень 💪"
          );

        fam.Baf.invite += 1;
        await ctx.reply(
          `Готово, теперь участники семьи получают +${
            fam.Baf.invite * 500
          } старок за добавление новых юзеров в чат 🎉`
        );
        break;

      case 7:
        if (fam.Baf.case === 2)
          return await ctx.reply(
            "Это улучшение уже имеет максимальный уровень 💪"
          );

        fam.Baf.case += 1;
        await ctx.reply(
          `Готово, теперь участники семьи могут открывать за одно открытие на ${fam.Baf.case} кейса больше 🎉`
        );
        break;

      default:
        break;
    }

    await fam.Baf.save();
    return next();
  } catch (error) {
    console.log(error);
  }
});

famModule.hears(/^семья топ/i, async (ctx, next) => {
  try {
    const fams = await getTopFams(10);

    const message = fams
      .map(
        (fam, index) =>
          `${index + 1}. «${fam.name}» ${fam.reputation} rep💫\n• ${
            fam.description
          }`
      )
      .join("\n\n");

    await ctx.reply(`🏆 Топ семей 🏆\n\n${message}`, {
      disable_notification: true,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    });
    return next();
  } catch (error) {
    console.log(error);
  }
});

famModule.hears(/^семья состав/i, async (ctx, next) => {
  try {
    const fam = await getFamilyByUserId(ctx.from.id);
    if (!fam) return await ctx.reply("У тебя нет семьи 😢");
    const list = await getFamilyMembers(fam.id, fam.name);

    await ctx.reply(list, { parse_mode: "HTML", disable_notification: true });

    return next();
  } catch (error) {
    console.log(error);
  }
});

famModule.hears(/^семья удалить/i, async (ctx, next) => {
  try {
    const fam = await getFamilyByUserId(ctx.from.id);
    if (!fam) return await ctx.reply("У тебя нет семьи 😢");
    if (fam.owner != ctx.from.id)
      return await ctx.reply("Только основатель может удалить семью");

    if (ctx.chat.type !== "private")
      return await ctx.reply("Удалить семью можно только в лс");

    await ctx.telegram.sendMessage(
      fam.owner,
      "ТЫ ДЕЙСТВИТЕЛЬНО ХОЧЕШЬ УДАЛИТЬ СЕМЬЮ?\n\nЭто необратимый процесс...",
      Keyboard.inline([
        [Key.callback("УДАЛИТЬ НАВСЕГДА", "deleteFam")],
        [Key.callback("Не удалять", "dell")],
      ])
    );

    return next();
  } catch (error) {
    console.log(error);
  }
});

famModule.hears(/^семья купить слот/i, async (ctx, next) => {
  try {
    const fam = await getFamilyByUserId(ctx.from.id);
    if (!fam) return await ctx.reply("У тебя нет семьи 😢");
    if (fam.owner != ctx.from.id)
      return await ctx.reply(
        "Только основатель может увеличивать слоты в семье"
      );

    if (fam.reputation < 50) {
      return await ctx.reply(
        "Недостаточно репутации для покупки слота 😢\n\nНужно 50 репутации"
      );
    }

    fam.reputation -= 50;
    fam.slots += 1;
    await ctx.reply(
      `Количество слотов успешно увеличено, теперь в семье ${fam.slots} слотов`
    );
    await fam.save();

    return next();
  } catch (error) {
    console.log(error);
  }
});

famModule.hears(/^передать монеты.*$/i, async (ctx, next) => {
  const chatId = ctx.from.id;
  const textParts = ctx.message.text.split(" ");
  const amount = parseInt(textParts[2]);

  if (isNaN(amount) || amount <= 0) {
    return;
  }

  let receiver;
  let viaUsername = false;

  try {
    const resolved = await resolveReceiver(ctx);
    receiver = resolved.receiver;
    viaUsername = resolved.transferredViaUsername;
  } catch (err) {
    switch (err.message) {
      case "BOT_REJECT":
        return ctx.reply("Зачем боту семейные монеты 🧐");
      case "NO_TARGET":
        return ctx.reply("Сделай реплай или укажи @username.");
      case "NOT_FOUND":
        return ctx.reply("Пользователь с таким username не найден.");
      case "SELF_TRANSFER":
        return ctx.reply("Иди нахуй, так нельзя🖕");
      default:
        console.error("resolveReceiver error:", err);
        return ctx.reply("Не удалось определить получателя.");
    }
  }

  try {
    const sender = await getUser(chatId);

    if (sender.famMoney < amount) {
      return ctx.reply("Недостаточно семейных монет 🥲");
    }

    sender.famMoney -= amount;
    receiver.famMoney += amount;
    await sender.save();
    await receiver.save();

    await ctx.reply(
      `Ты успешно передал(а) ${separateNumber(amount)} семейных монет ` +
        `${receiver.firstname}`
    );

    if (viaUsername) {
      try {
        await ctx.telegram.sendMessage(
          receiver.chatId,
          `Тебе передали ${separateNumber(amount)} семейных монет от ${
            ctx.from.first_name
          }`
        );
      } catch (e) {
        console.log("Не удалось отправить личное сообщение:", e.message);
      }
    }

    return next();
  } catch (error) {
    console.error("Ошибка передачи семейных монет:", error);
    return ctx.reply("Ошибка при выполнении операции.");
  }
});

export default famModule;
