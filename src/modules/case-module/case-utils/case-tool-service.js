import { syncUserCaseToDb } from "../../../db/functions.js";
import { currentTransaction } from "../../../db/config.js";
import { Case } from "../../../db/models.js";
import cases from "../cases.js";

const getUserCase = async (id) => {
  await syncUserCaseToDb(id);
  const transaction = currentTransaction();
  let cases = await Case.findOne({ where: { userId: id }, ...(transaction ? { transaction, lock: transaction.LOCK.UPDATE } : {}) });
  return cases;
};

const getCaseInfo = async (id, ctx) => {
  const needCase = cases[id];

  if (!needCase) {
    await ctx.reply("Такого кейса вообще нет😥");
    return;
  }

  const info = needCase.items;

  await ctx.reply(`❗️${needCase.name}❗️\n\n${info}`);
};

export { getUserCase, getCaseInfo };
