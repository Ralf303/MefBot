import { Router } from "express";
import {
  blendImages,
  getAnimConfig,
  isAnimatedItem,
  renderAnimatedVideo,
} from "../modules/items-module/items-utils/blend-items-service.js";
import { Item } from "../db/models.js";
import { getRandomInt } from "../utils/helpers.js";
import path from "path";
import { getUser } from "../db/functions.js";
import fs from "fs/promises";

const usersItemRouter = new Router();

usersItemRouter.get("/getPhoto", async (req, res) => {
  try {
    const userId = req.query.userId;
    const user = await getUser(userId);

    const items = await Item.findAll({
      where: { userId: user.id, isWorn: true },
    });

    if (items.length === 0) {
      res.sendFile(path.join(__dirname, "../../img/no_bg.png"));
      return;
    }

    for (const item of items) {
      if (item.itemName === "BEARBRICKS") {
        const number = getRandomInt(1, 32);
        item.src = `img/bear_${number}.png`;
        await item.save();
      }
    }

    const animatedItems = items.filter((i) => isAnimatedItem(i));
    const staticItems = items.filter((i) => !isAnimatedItem(i));

    if (animatedItems.length === 0) {
      const src = staticItems.map((i) => i.src);
      const imageBuffer = await blendImages(src, "./img/no_bg.png");
      res.contentType("image/png");
      res.send(imageBuffer);
      return;
    }

    const animated = animatedItems.map((i) => {
      const c = getAnimConfig(i);
      return { src: i.src, x: c.x, y: c.y, scale: c.scale, fps: c.fps };
    });

    const baseBg = "./img/no_bg.png";
    const staticSrcs = staticItems.map((i) => i.src);
    const staticBuffer = await blendImages(staticSrcs, baseBg);

    const tmpPngPath = path.join(
      process.cwd(),
      "anims",
      `api_${user.id}_${Date.now()}.png`
    );
    await fs.mkdir(path.dirname(tmpPngPath), { recursive: true });
    await fs.writeFile(tmpPngPath, staticBuffer);

    const videoPath = await renderAnimatedVideo({
      charPngPath: tmpPngPath,
      animatedItems: animated,
      home: null,
    });

    const videoBuffer = await fs.readFile(videoPath);

    res.contentType("video/mp4");
    res.send(videoBuffer);

    try {
      await fs.unlink(tmpPngPath);
      await fs.unlink(videoPath);
    } catch {}
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal error");
  }
});

export default usersItemRouter;
