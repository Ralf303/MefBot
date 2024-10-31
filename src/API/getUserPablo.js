const { Router } = require("express");
const {
  blendImages,
} = require("../modules/items-module/items-utils/blend-items-service");
const { Item } = require("../db/models");
const { getRandomInt } = require("../utils/helpers");
const path = require("path");
const { getUser } = require("../db/functions");

const usersItemRouter = new Router();

usersItemRouter.get("/getPhoto", async (req, res) => {
  try {
    const userId = req.query.userId;

    const user = await getUser(userId);

    const items = await Item.findAll({
      where: {
        userId: user.id,
        isWorn: true,
      },
    });

    if (items.length === 0) {
      res.sendFile(path.join(__dirname, "../../img/no_bg.png"));
      return;
    }

    items.forEach(async (item) => {
      if (item.itemName === "BEARBRICKS") {
        const number = getRandomInt(1, 32);
        item.src = `img/bear_${number}.png`;
        await item.save();
      }
    });

    const src = items.map((item) => `${item.src}`);
    const imageBuffer = await blendImages(src, "./img/no_bg.png");
    res.contentType("image/jpeg");
    res.send(imageBuffer);
  } catch (error) {
    console.log(error);
  }
});

module.exports = usersItemRouter;
