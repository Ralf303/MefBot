import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import { spawn } from "child_process";
import crypto from "crypto";
import { CronJob } from "cron";
import { Item } from "../../../db/models.js";
import { separateNumber, getRandomInt } from "../../../utils/helpers.js";
import redisService from "../../../services/redis-service.js";
import itemsConfig from "../items.js";

const ANIMS_DIR = path.resolve(process.cwd(), "anims");
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

function baseBgFor(home) {
  return home ? "./img/no_bg.png" : "./img/bg.png";
}

async function listUserAnimFiles(chatId) {
  await ensureAnimsDir();
  const prefix = `${chatId}_`;
  const files = await fs.readdir(ANIMS_DIR);
  return files
    .filter((f) => f.startsWith(prefix) && f.endsWith(".mp4"))
    .map((f) => path.join(ANIMS_DIR, f));
}

async function removeFiles(paths) {
  for (const p of paths) {
    try {
      await fs.unlink(p);
    } catch {}
  }
}

export function isAnimatedSrc(src) {
  if (!src) return false;
  const ext = path.extname(src).toLowerCase();
  return ext === ".gif" || ext === ".webp" || ext === ".apng";
}

export function isAnimatedItem(dbItem) {
  const byExt = isAnimatedSrc(dbItem.src);
  let byConfig = false;
  try {
    const conf = Object.values(itemsConfig || {}).find(
      (v) => v?.name === dbItem.itemName
    );
    byConfig = Boolean(conf?.animated);
  } catch {}
  return byExt || byConfig;
}

export function getAnimConfig(dbItem) {
  const conf = Object.values(itemsConfig).find(
    (v) => v?.name === dbItem.itemName
  );
  const a = conf?.anim || {};
  return { x: a.x ?? 0, y: a.y ?? 0, scale: a.scale ?? 256, fps: a.fps ?? 30 };
}

function buildAnimFingerprint({ userId, staticSrcs, animatedList, home }) {
  const payload = {
    userId,
    staticSrcs: [...staticSrcs].sort(),
    animated: animatedList.map((a) => ({
      src: a.src,
      x: a.x,
      y: a.y,
      scale: a.scale,
      fps: a.fps,
    })),
    home: home
      ? { src: home.src, x: home.x, y: home.y, scale: home.scale }
      : null,
    engine: "v1-final",
  };
  return crypto
    .createHash("sha1")
    .update(JSON.stringify(payload))
    .digest("hex");
}

async function ensureAnimsDir() {
  await fs.mkdir(ANIMS_DIR, { recursive: true });
}

async function writeTempPng(buffer) {
  const name = `tmp_${Date.now()}_${Math.random().toString(36).slice(2)}.png`;
  const full = path.join(ANIMS_DIR, name);
  await fs.writeFile(full, buffer);
  return full;
}

function execFfmpeg(args, { timeoutMs = 30000, tag = "ffmpeg" } = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn("ffmpeg", ["-y", "-loglevel", "error", ...args], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stderr = "";
    let done = false;
    const kill = () => {
      if (done) return;
      done = true;
      try {
        p.kill("SIGKILL");
      } catch {}
    };
    const timer = setTimeout(() => {
      kill();
      reject(
        new Error(`${tag} timeout after ${timeoutMs}ms. Stderr:\n${stderr}`)
      );
    }, timeoutMs);
    p.stderr.on("data", (d) => {
      stderr += d.toString();
    });
    p.on("close", (code) => {
      if (done) return;
      clearTimeout(timer);
      done = true;
      if (code === 0) resolve(null);
      else reject(new Error(`${tag} exit ${code}. Stderr:\n${stderr}`));
    });
  });
}

export async function blendImages(imagePaths, backgroundPath) {
  const composites = imagePaths.map((p) => ({ input: p, left: 0, top: 0 }));
  return sharp(backgroundPath)
    .composite(composites)
    .png({ compressionLevel: 9 })
    .toBuffer();
}

export async function overlayImage(foregroundBufferOrPath, home) {
  const fg = sharp(foregroundBufferOrPath);
  const resized = await fg.resize({ width: home.scale }).png().toBuffer();
  return sharp(home.src)
    .composite([{ input: resized, left: home.x, top: home.y }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

export async function renderAnimatedVideo({
  charPngPath,
  animatedItems,
  home,
  durationSec = 3,
  transparent = false,
}) {
  await ensureAnimsDir();

  const isTransparent = Boolean(transparent);
  const codec = isTransparent ? "libvpx-vp9" : "libx264";
  const pixFmt = isTransparent ? "yuva420p" : "yuv420p";
  const fileExt = isTransparent ? ".webm" : ".mp4";

  const colorFilter = isTransparent
    ? `color=c=0x15171aff:size=720x720:d=${durationSec}[bg];[bg][0:v]overlay=0:0:shortest=1[tmp];`
    : "";

  if (!home) {
    const baseVideo = path.join(
      ANIMS_DIR,
      `base_${Date.now()}_${Math.random().toString(36).slice(2)}${fileExt}`
    );

    await execFfmpeg(
      [
        "-loop",
        "1",
        "-t",
        String(durationSec),
        "-i",
        charPngPath,
        "-r",
        "30",
        "-an",
        "-c:v",
        codec,
        "-pix_fmt",
        pixFmt,
        ...(isTransparent
          ? ["-b:v", "1M"]
          : [
              "-preset",
              "veryfast",
              "-profile:v",
              "baseline",
              "-level",
              "3.0",
              "-movflags",
              "+faststart",
            ]),
        "-filter_complex",
        `${colorFilter}${
          isTransparent ? "[tmp]" : "[0:v]"
        }scale='min(720,iw)':'-2',format=rgba[vout]`,
        "-map",
        "[vout]",
        "-shortest",
        "-r",
        "30",
        "-an",
        "-c:v",
        codec,
        "-pix_fmt",
        pixFmt,
        ...(isTransparent
          ? ["-b:v", "1M"]
          : [
              "-preset",
              "veryfast",
              "-profile:v",
              "baseline",
              "-level",
              "3.0",
              "-movflags",
              "+faststart",
              "-crf",
              "23",
            ]),
        baseVideo,
      ],
      { timeoutMs: 15000, tag: "mkBaseVideo" }
    );

    try {
      await fs.unlink(charPngPath);
    } catch {}

    let currentVideo = baseVideo;

    for (let i = 0; i < animatedItems.length; i++) {
      const { src, x = 0, y = 0, scale = 256, fps = 30 } = animatedItems[i];
      const ext = path.extname(src).toLowerCase();
      const nextVideo = path.join(
        ANIMS_DIR,
        `ovl_${i}_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2)}${fileExt}`
      );

      const inputs = ["-i", currentVideo];
      if (ext === ".gif") inputs.push("-ignore_loop", "0");
      inputs.push("-i", src);

      const filter =
        `[1:v]fps=${fps},scale=${scale}:-1,format=rgba,setpts=PTS-STARTPTS[a];` +
        `[0:v][a]overlay=${x}:${y}:shortest=1:format=auto[ov];` +
        `[ov]scale='min(720,iw)':'-2',format=${pixFmt}[vout]`;

      await execFfmpeg(
        [
          ...inputs,
          "-t",
          String(durationSec),
          "-filter_complex",
          filter,
          "-map",
          "[vout]",
          "-shortest",
          "-r",
          "30",
          "-an",
          "-c:v",
          codec,
          "-pix_fmt",
          pixFmt,
          ...(isTransparent
            ? ["-b:v", "1M"]
            : [
                "-preset",
                "veryfast",
                "-profile:v",
                "baseline",
                "-level",
                "3.0",
                "-movflags",
                "+faststart",
                "-crf",
                "23",
              ]),
          nextVideo,
        ],
        { timeoutMs: 25000, tag: `overlay-${i}` }
      );

      try {
        await fs.unlink(currentVideo);
      } catch {}
      currentVideo = nextVideo;
    }

    return currentVideo;
  }

  const inputs = ["-loop", "1", "-t", String(durationSec), "-i", charPngPath];
  for (const anim of animatedItems) {
    const ext = path.extname(anim.src).toLowerCase();
    if (ext === ".gif") inputs.push("-ignore_loop", "0");
    inputs.push("-i", anim.src);
  }
  inputs.push("-loop", "1", "-t", String(durationSec), "-i", home.src);

  let filter = "";
  let last = "[0:v]";
  let streamIndex = 1;

  animatedItems.forEach((anim, i) => {
    const tagScaled = `[a${i}:scaled]`;
    const tagOver = `[a${i}:over]`;
    const scale = anim.scale || 256;
    const fps = anim.fps || 30;
    const x = anim.x || 0;
    const y = anim.y || 0;
    filter += `[${streamIndex}:v]fps=${fps},scale=${scale}:-1,format=rgba,setpts=PTS-STARTPTS${tagScaled};`;
    filter += `${last}${tagScaled}overlay=${x}:${y}:shortest=1:format=auto${tagOver};`;
    last = tagOver;
    streamIndex += 1;
  });

  filter += `${last}scale=${home.scale}:-1[char_sized];`;
  filter += `[${streamIndex}:v][char_sized]overlay=${home.x}:${home.y}:shortest=1:format=auto[ov];`;
  filter += `[ov]scale='min(720,iw)':'-2',format=${pixFmt}[vout]`;

  const outPath = path.join(
    ANIMS_DIR,
    `home_${Date.now()}_${Math.random().toString(36).slice(2)}${fileExt}`
  );

  await execFfmpeg(
    [
      ...inputs,
      "-filter_complex",
      filter,
      "-map",
      "[vout]",
      "-shortest",
      "-r",
      "30",
      "-an",
      "-c:v",
      codec,
      "-pix_fmt",
      pixFmt,
      ...(isTransparent
        ? ["-b:v", "1M"]
        : [
            "-preset",
            "veryfast",
            "-profile:v",
            "baseline",
            "-level",
            "3.0",
            "-movflags",
            "+faststart",
            "-crf",
            "23",
          ]),
      outPath,
    ],
    { timeoutMs: 30000, tag: "one-shot-home" }
  );

  try {
    await fs.unlink(charPngPath);
  } catch {}
  return outPath;
}

export const getWornItems = async (user, ctx, home, dbHome) => {
  try {
    const homeKey = home ? `${home.src}` : "default";
    const redisKey = `pablo_${user.id}_${homeKey}`;
    const srcKey = `src_${user.id}`;

    let bufferBase64 = await redisService.get(redisKey);
    let srcInRedis = await redisService.get(srcKey);

    const items = await Item.findAll({
      where: { userId: user.id, isWorn: true },
    });

    for (const item of items) {
      if (item.itemName === "BEARBRICKS") {
        const n = getRandomInt(1, 32);
        item.src = `img/bear_${n}.png`;
        await item.save();
      }
      if (item.itemName === "Хомяк") {
        const n = getRandomInt(1, 31);
        item.src = `img/homa_${n}.png`;
        await item.save();
      }
      if (item.itemName === "Balance Bag") {
        let number;
        const { balance } = user;
        if (balance <= 100000) number = 1;
        else if (balance <= 500000) number = 2;
        else if (balance <= 1000000) number = 3;
        else if (balance <= 5000000) number = 4;
        else if (balance <= 10000000) number = 5;
        else if (balance <= 25000000) number = 6;
        else number = 7;
        item.src = `img/moneyBag_${number}.png`;
        await item.save();
      }
    }

    const allSrc = items.map((i) => `${i.src}`);
    const animatedItemsRaw = items.filter((i) => isAnimatedItem(i));
    const staticItemsSrc = items
      .filter((i) => !isAnimatedItem(i))
      .map((i) => `${i.src}`);

    if (animatedItemsRaw.length === 0) {
      let buffer;
      const srcJson = JSON.stringify(allSrc);
      const needRegen = !bufferBase64 || srcInRedis !== srcJson;
      if (needRegen) {
        const baseBg = baseBgFor(home);
        const merged = await blendImages(allSrc, baseBg);
        buffer = home ? await overlayImage(merged, home) : merged;
        await redisService.set(redisKey, buffer.toString("base64"));
        await redisService.set(srcKey, srcJson);
      } else {
        buffer = Buffer.from(bufferBase64, "base64");
      }
      const wornItems = items.map(
        (item) => `• ${item.itemName}[<code>${item.id}</code>](+${item.lvl})`
      );
      const homeInfo = home
        ? `\n🏠 Твой дом «${home.name}»\n💸 Налог: ${separateNumber(
            dbHome.tax
          )}/36.000\n⚡️ Электричество: ${separateNumber(dbHome.energy)}/10.000`
        : "";
      if (wornItems.length === 0) {
        let imgSrc;
        if (home) {
          imgSrc = `./img/no_bg.png`;
          imgSrc = await overlayImage(imgSrc, home);
        } else {
          imgSrc = await blendImages([], `./img/bg.png`);
        }
        await ctx.replyWithPhoto(
          { source: imgSrc },
          {
            caption: `На тебе ничего не надето\n\n${homeInfo}`,
            reply_to_message_id: ctx.message.message_id,
          }
        );
        return;
      }
      const rows = wornItems.map((item) => item);
      await ctx.replyWithPhoto(
        { source: buffer },
        {
          parse_mode: "HTML",
          caption: `👕 На тебе надето:\n${rows.join("\n")}\n\n${homeInfo}`,
          reply_to_message_id: ctx.message.message_id,
        }
      );
      return;
    }

    const animatedItems = animatedItemsRaw.map((i) => {
      const c = getAnimConfig(i);
      return { src: i.src, x: c.x, y: c.y, scale: c.scale, fps: c.fps };
    });

    const fp = buildAnimFingerprint({
      userId: user.id,
      staticSrcs: staticItemsSrc,
      animatedList: animatedItems,
      home,
    });

    await ensureAnimsDir();
    const chatId = String(user.id);
    const desiredPath = path.join(ANIMS_DIR, `${chatId}_${fp}.mp4`);
    const existingForUser = await listUserAnimFiles(chatId);

    if (existingForUser.includes(desiredPath)) {
      const wornItems = items.map(
        (item) => `• ${item.itemName}[<code>${item.id}</code>](+${item.lvl})`
      );
      const homeInfo = home
        ? `\n🏠 Твой дом «${home.name}»\n💸 Налог: ${separateNumber(
            dbHome.tax
          )}/36.000\n⚡️ Электричество: ${separateNumber(dbHome.energy)}/10.000`
        : "";
      const rows = wornItems.map((item) => item);
      await ctx.replyWithAnimation(
        { source: desiredPath },
        {
          parse_mode: "HTML",
          caption: `👕 На тебе надето:\n${rows.join("\n")}\n\n${homeInfo}`,
          reply_to_message_id: ctx.message.message_id,
        }
      );
      return;
    }

    if (existingForUser.length) {
      await removeFiles(existingForUser);
    }

    const baseBg = baseBgFor(home);
    const charBase = await blendImages(staticItemsSrc, baseBg);
    const charBasePath = await writeTempPng(charBase);

    const videoPath = await renderAnimatedVideo({
      charPngPath: charBasePath,
      animatedItems,
      home,
    });

    try {
      await fs.rename(videoPath, desiredPath);
    } catch {}

    const wornItems = items.map(
      (item) => `• ${item.itemName}[<code>${item.id}</code>](+${item.lvl})`
    );
    const homeInfo = home
      ? `\n🏠 Твой дом «${home.name}»\n💸 Налог: ${separateNumber(
          dbHome.tax
        )}/36.000\n⚡️ Электричество: ${separateNumber(dbHome.energy)}/10.000`
      : "";
    const rows = wornItems.map((item) => item);

    await ctx.replyWithAnimation(
      { source: desiredPath },
      {
        parse_mode: "HTML",
        caption: `👕 На тебе надето:\n${rows.join("\n")}\n\n${homeInfo}`,
        reply_to_message_id: ctx.message.message_id,
      }
    );
  } catch (error) {
    await ctx.reply("Что-то пошло не так");
  }
};

export const tryItem = async (itemInfo, ctx, id) => {
  if (!itemInfo?.canBuy) {
    await ctx.reply("Эту вещь нельзя примерить");
    return;
  }
  if (itemInfo.animated || isAnimatedSrc(itemInfo.src)) {
    const c = itemsConfig?.[
      Object.keys(itemsConfig).find(
        (k) => itemsConfig[k].name === itemInfo.name
      )
    ]?.anim || { x: 0, y: 0, scale: 256, fps: 30 };
    const base = await blendImages([], `./img/no_bg.png`);
    const charPath = await writeTempPng(base);
    const pathOut = await renderAnimatedVideo({
      charPngPath: charPath,
      animatedItems: [
        {
          src: itemInfo.src,
          x: c.x ?? 0,
          y: c.y ?? 0,
          scale: c.scale ?? 256,
          fps: c.fps ?? 30,
        },
      ],
      home: null,
    });
    await ctx.replyWithAnimation(
      { source: pathOut },
      {
        parse_mode: "HTML",
        caption: `Вот как будет выглядить ${itemInfo.name}[${id}]\nКупить ее можно командой:\n<code>Купить вещь ${id}</code>`,
      }
    );
    return;
  }
  const preview = await blendImages([itemInfo.src], `./img/bg.png`);
  await ctx.replyWithPhoto(
    { source: preview },
    {
      parse_mode: "HTML",
      caption: `Вот как будет выглядить ${itemInfo.name}[${id}]\nКупить ее можно командой:\n<code>Купить вещь ${id}</code>`,
    }
  );
};

async function cleanupAnimsDir() {
  try {
    await ensureAnimsDir();
    const files = await fs.readdir(ANIMS_DIR);
    const now = Date.now();
    for (const f of files) {
      if (!/\.(mp4|png)$/i.test(f)) continue;
      const full = path.join(ANIMS_DIR, f);
      try {
        const stat = await fs.stat(full);
        if (now - stat.mtimeMs > MAX_AGE_MS) {
          await fs.unlink(full);
        }
      } catch {}
    }
  } catch {}
}

export function startAnimsCleanupCron() {
  const job = new CronJob("0 0 * * *", async () => {
    await cleanupAnimsDir();
  });
  job.start();
  return job;
}
