import { Composer } from "telegraf";
import { withUserTransaction } from "../services/transaction-service.js";
const compose = new Composer();
for (const [action, field, price, maximum] of [["timeapp", "timelvl", 10000, 4], ["mefapp", "meflvl", 20000, 4], ["slotapp", "slots", 5000, 200]]) {
  compose.action(action, async (ctx) => {
    const message = await withUserTransaction(ctx.state.user, async (user, transaction) => {
      if (user[field] >= maximum) return "Ты уже достиг максимального уровня 💪";
      if (user.balance < price) return "Недостаточно старок 😢";
      user.balance -= price;
      user[field]++;
      await user.save({ transaction });
      return "Покупка прошла успешно! Новый уровень: " + user[field];
    });
    await ctx.deleteMessage().catch(() => {});
    await ctx.reply(message);
  });
}
export default compose;
