import { Case } from "../../../db/models.js";
import cases from "../cases.js";

const getUserCase = async (id) => {
  let cases = await Case.findOne({ where: { userId: id } });
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
