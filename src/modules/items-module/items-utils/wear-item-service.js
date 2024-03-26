const { Item } = require("../../../db/models");

const wearItem = async (user, id, ctx) => {
  try {
    const item = await Item.findOne({
      where: {
        id: id,
        userId: user.id,
      },
    });

    // проверяем, что указанный предмет существует
    if (!item) {
      await ctx.reply("Такой вещи у вас нет😥");
      return;
    }

    // проверяем, что предмет еще не надет
    if (item.isWorn) {
      await ctx.reply("Эта вещь уже надета😎");
      return;
    }

    // проверяем, что указанный слот еще свободен
    const bodyPart = item.bodyPart;
    const wornItem = await Item.findOne({
      where: {
        userId: user.id,
        bodyPart: bodyPart,
        isWorn: true,
      },
    });

    if (wornItem) {
      // если на указанном слоте уже есть другая надетая вещь, снимаем ее
      wornItem.isWorn = false;
      await wornItem.save();
    }

    if (bodyPart === "legs") {
      // если надеваем вещь с bodyPart = 'legs', снимаем предыдущие items на leg1 и leg2
      const wornLegItem1 = await Item.findOne({
        where: {
          userId: user.id,
          bodyPart: "leg1",
          isWorn: true,
        },
      });

      const wornLegItem2 = await Item.findOne({
        where: {
          userId: user.id,
          bodyPart: "leg2",
          isWorn: true,
        },
      });

      for (let i = 1; i <= 5; i++) {
        const wornFnafItem = await Item.findOne({
          where: {
            userId: user.id,
            bodyPart: `fnaf_set${i}`,
            isWorn: true,
          },
        });

        if (wornFnafItem) {
          wornFnafItem.isWorn = false;
          await wornFnafItem.save();
        }
      }

      for (let i = 1; i <= 7; i++) {
        const wornPupsItem = await Item.findOne({
          where: {
            userId: user.id,
            bodyPart: `pups_set${i}`,
            isWorn: true,
          },
        });

        if (wornPupsItem) {
          wornPupsItem.isWorn = false;
          await wornPupsItem.save();
        }
      }

      if (wornLegItem1) {
        wornLegItem1.isWorn = false;
        await wornLegItem1.save();
      }

      if (wornLegItem2) {
        wornLegItem2.isWorn = false;
        await wornLegItem2.save();
      }
    }

    if (bodyPart === "leg1" || bodyPart === "leg2") {
      // если надеваем вещь с bodyPart = 'leg1' или 'leg2', снимаем вещь с bodyPart = 'legs'
      const wornLegsItem = await Item.findOne({
        where: {
          userId: user.id,
          bodyPart: "legs",
          isWorn: true,
        },
      });

      for (let i = 1; i <= 5; i++) {
        const wornFnafItem = await Item.findOne({
          where: {
            userId: user.id,
            bodyPart: `fnaf_set${i}`,
            isWorn: true,
          },
        });

        if (wornFnafItem) {
          wornFnafItem.isWorn = false;
          await wornFnafItem.save();
        }
      }

      for (let i = 1; i <= 7; i++) {
        const wornPupsItem = await Item.findOne({
          where: {
            userId: user.id,
            bodyPart: `pups_set${i}`,
            isWorn: true,
          },
        });

        if (wornPupsItem) {
          wornPupsItem.isWorn = false;
          await wornPupsItem.save();
        }
      }

      if (wornLegsItem) {
        wornLegsItem.isWorn = false;
        await wornLegsItem.save();
      }
    }

    if (bodyPart.includes("fnaf_set")) {
      const wornLegItem1 = await Item.findOne({
        where: {
          userId: user.id,
          bodyPart: "leg1",
          isWorn: true,
        },
      });

      const wornLegItem2 = await Item.findOne({
        where: {
          userId: user.id,
          bodyPart: "leg2",
          isWorn: true,
        },
      });

      const wornLegItem3 = await Item.findOne({
        where: {
          userId: user.id,
          bodyPart: "legs",
          isWorn: true,
        },
      });

      for (let i = 1; i <= 7; i++) {
        const wornPupsItem = await Item.findOne({
          where: {
            userId: user.id,
            bodyPart: `pups_set${i}`,
            isWorn: true,
          },
        });

        if (wornPupsItem) {
          wornPupsItem.isWorn = false;
          await wornPupsItem.save();
        }
      }

      if (wornLegItem1) {
        wornLegItem1.isWorn = false;
        await wornLegItem1.save();
      }

      if (wornLegItem2) {
        wornLegItem2.isWorn = false;
        await wornLegItem2.save();
      }

      if (wornLegItem3) {
        wornLegItem3.isWorn = false;
        await wornLegItem3.save();
      }
    }

    if (bodyPart.includes("pups_set")) {
      const wornLegItem1 = await Item.findOne({
        where: {
          userId: user.id,
          bodyPart: "leg1",
          isWorn: true,
        },
      });

      const wornLegItem2 = await Item.findOne({
        where: {
          userId: user.id,
          bodyPart: "leg2",
          isWorn: true,
        },
      });

      for (let i = 1; i <= 5; i++) {
        const wornFnafItem = await Item.findOne({
          where: {
            userId: user.id,
            bodyPart: `fnaf_set${i}`,
            isWorn: true,
          },
        });

        if (wornFnafItem) {
          wornFnafItem.isWorn = false;
          await wornFnafItem.save();
        }
      }

      const wornLegItem3 = await Item.findOne({
        where: {
          userId: user.id,
          bodyPart: "legs",
          isWorn: true,
        },
      });
      if (wornLegItem1) {
        wornLegItem1.isWorn = false;
        await wornLegItem1.save();
      }

      if (wornLegItem2) {
        wornLegItem2.isWorn = false;
        await wornLegItem2.save();
      }

      if (wornLegItem3) {
        wornLegItem3.isWorn = false;
        await wornLegItem3.save();
      }
    }

    if (bodyPart === "set") {
      const wornFace = await Item.findOne({
        where: {
          userId: user.id,
          bodyPart: "face",
          isWorn: true,
        },
      });

      const wornHead = await Item.findOne({
        where: {
          userId: user.id,
          bodyPart: "head",
          isWorn: true,
        },
      });

      if (wornFace) {
        wornFace.isWorn = false;
        await wornFace.save();
      }

      if (wornHead) {
        wornHead.isWorn = false;
        await wornHead.save();
      }
    }

    if (bodyPart === "face" || bodyPart === "head") {
      const wornSetItem = await Item.findOne({
        where: {
          userId: user.id,
          bodyPart: "set",
          isWorn: true,
        },
      });

      if (wornSetItem) {
        wornSetItem.isWorn = false;
        await wornSetItem.save();
      }
    }

    // надеваем указанный предмет
    item.isWorn = true;
    await item.save();

    await ctx.reply(`Вы надели ${item.itemName}[${id}]`);
  } catch (error) {
    console.log(error);
    await ctx.reply("Что-то пошло не так");
  }
};
module.exports = { wearItem };
