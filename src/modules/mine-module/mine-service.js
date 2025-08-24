import { Card, CardStand, Mining } from "../../db/models.js";
import { Op } from "sequelize";

const getMineInfo = async () => {
  const mineInfo = await Mining.findOne({
    where: {
      id: 1,
    },
  });

  return mineInfo;
};

async function increaseCardBalances() {
  const stands = await CardStand.findAll({
    where: {
      cardId: { [Op.ne]: null },
    },
    include: [Card],
  });

  for (const stand of stands) {
    const card = stand.card;

    if (card && card.lvl === 0) {
      card.balance += 0.5;
      await card.save();
    }

    if (card && card.fuel > 0 && card.lvl > 0) {
      card.balance += 0.5 * card.lvl;
      await card.save();
    }
  }
}

async function updateFreezeBalances() {
  const stands = await CardStand.findAll({
    where: {
      cardId: { [Op.ne]: null },
    },
    include: [Card],
  });

  for (const stand of stands) {
    const card = stand.card;
    if (card && card.fuel > 0) {
      card.fuel -= 1;
      await card.save();
    }
  }
}
export { getMineInfo, increaseCardBalances, updateFreezeBalances };
