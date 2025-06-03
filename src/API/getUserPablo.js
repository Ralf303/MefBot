import { Router } from "express";
import {
  blendImages,
} from "../modules/items-module/items-utils/blend-items-service.js";
import { Item } from "../db/models.js";
import { getRandomInt } from "../utils/helpers.js";
import path from "path";
import { getUser } from "../db/functions.js";

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

export default usersItemRouter;
