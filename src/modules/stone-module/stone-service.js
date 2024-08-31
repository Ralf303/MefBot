const { Item } = require("../../db/models");
const { getRandomInt } = require("../../utils/helpers");

const upgradeItem = async (user, itemId) => {
  try {
    const hasItem = await Item.findOne({
      where: {
        userId: user.id,
        id: itemId,
      },
    });

    if (!hasItem) {
      return "У тебя нет этой вещи 😥";
    }

    if (user.stones === 0) {
      return "У тебя не достаточно точильных камней 😥";
    }

    if (hasItem.lvl === 10) {
      return "Эта вещь уже максимального уровня 💪";
    }

    const chance = getRandomInt(0, 100);

    let percent = 100 - (hasItem.lvl + 1) * 10;

    if (hasItem.lvl === 9) {
      percent = 1;
    }

    if (hasItem.lvl === 0) {
      percent = 90;
    }

    if (chance <= percent) {
      hasItem.lvl += 1;
      await hasItem.save();

      user.stones -= 1;
      await user.save();

      return `Ты успешно улучшил ${hasItem.itemName} до ${hasItem.lvl} уровня 🎉`;
    } else {
      user.stones -= 1;
      await user.save();

      return "Ты не смог улучшить вещь, камень утерян 😥";
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  upgradeItem,
};
