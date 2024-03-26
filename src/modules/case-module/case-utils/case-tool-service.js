const { Case } = require("../../../db/models");
const cases = require("../cases");

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

module.exports = { getUserCase, getCaseInfo };
