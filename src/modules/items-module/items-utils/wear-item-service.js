const { Item } = require("../../../db/models");

const wearItem = async (user, id, ctx) => {
  try {
    const item = await Item.findOne({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!item) {
      await ctx.reply("Такой вещи у тебя нет😥");
      return;
    }

    if (item.isWorn) {
      await ctx.reply("Эта вещь уже надета😎");
      return;
    }

    const bodyPart = item.bodyPart;
    const wornItem = await Item.findOne({
      where: {
        userId: user.id,
        bodyPart: bodyPart,
        isWorn: true,
      },
    });

    if (wornItem) {
      wornItem.isWorn = false;
      await wornItem.save();
    }

    if (bodyPart === "legs") {
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

    item.isWorn = true;
    await item.save();

    await ctx.reply(`Ты надел(а) ${item.itemName}[${id}](+${item.lvl})`);
  } catch (error) {
    console.log(error);
    await ctx.reply("Что-то пошло не так");
  }
};
module.exports = { wearItem };
