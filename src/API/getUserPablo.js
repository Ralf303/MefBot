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
import util from "util";
import { exec } from "child_process";

const execAsync = util.promisify(exec);
const usersItemRouter = new Router();

usersItemRouter.get("/getPhoto", async (req, res) => {
  try {
    const userId = req.query.userId;
    const format = (req.query.format || "mp4").toString().toLowerCase();

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

    if (format === "gif") {
      const gifPath = videoPath.replace(/\.mp4$/, ".gif");
      await execAsync(`
        ffmpeg -i "${videoPath}" -filter_complex "[0:v]split[x][z];[x]palettegen[p];[z][p]paletteuse" -f gif - | gifsicle --colors 256 --optimize=3 --transparent "#000000" > "${gifPath}"
      `);
      const gifBuffer = await fs.readFile(gifPath);
      res.contentType("image/gif");
      res.send(gifBuffer);
      await fs.unlink(tmpPngPath).catch(() => {});
      await fs.unlink(videoPath).catch(() => {});
      await fs.unlink(gifPath).catch(() => {});
      return;
    }

    if (format === "webm") {
      const webmPath = videoPath.replace(/\.mp4$/, ".webm");
      await execAsync(`
        ffmpeg -i "${videoPath}" -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 1M "${webmPath}"
      `);
      const webmBuffer = await fs.readFile(webmPath);
      res.contentType("video/webm");
      res.send(webmBuffer);
      await fs.unlink(tmpPngPath).catch(() => {});
      await fs.unlink(videoPath).catch(() => {});
      await fs.unlink(webmPath).catch(() => {});
      return;
    }

    const videoBuffer = await fs.readFile(videoPath);
    res.contentType("video/mp4");
    res.send(videoBuffer);

    await fs.unlink(tmpPngPath).catch(() => {});
    await fs.unlink(videoPath).catch(() => {});
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal error");
  }
});

export default usersItemRouter;
