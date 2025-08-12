import { Router } from "express";

import {
  getHomeImg,
  getHomeById,
  getHomeByUserId,
  getAllHomesWithImgs,
  generateHomeImg,
} from "../modules/home-module/home-service.js";
import { getUser } from "../db/functions.js";
import { Home } from "../db/models.js";
import { home } from "../modules/home-module/home.js";
import redisService from "../services/redis-service.js";
import path from "path";
import fs from "fs";

const homeApi = new Router();

homeApi.get("/homeCount", async (req, res) => {
  try {
    const count = await Home.count();

    return res.json(count);
  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка сервера");
  }
});

homeApi.get("/getHome", async (req, res) => {
  try {
    const { id } = req.query;
    const homesWithImages = await getHomeImg(id);

    return res.json(homesWithImages);
  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка сервера");
  }
});

homeApi.get("/getHomes", async (req, res) => {
  try {
    const houses = await Home.findAll({ include: "user" });

    const results = houses.map((house) => {
      const data = house.toJSON();
      data.imgUrl = `/homeImage/${house.id}`;
      return data;
    });

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка сервера");
  }
});

homeApi.get("/homeImage/:id", async (req, res) => {
  try {
    const house = await Home.findByPk(req.params.id, { include: "user" });
    if (!house) return res.status(404).send("Дом не найден");

    const imgConfig = home[house.homeId];
    if (!imgConfig) return res.status(404).send("Изображение не найдено");

    const redisKey = `api_pablo_${house.userId || "api_empty"}_${
      imgConfig.src
    }`;

    let imgBuffer = await redisService.getBuffer(redisKey);

    if (!imgBuffer) {
      if (!house.userId) {
        imgBuffer = fs.readFileSync(path.resolve(process.cwd(), imgConfig.src));
      } else {
        const generatedBase64 = await generateHomeImg(house.user, imgConfig);
        imgBuffer = Buffer.from(generatedBase64, "base64");
      }
      await redisService.setBuffer(redisKey, imgBuffer, 86400);
    }

    res.set("Content-Type", "image/png");
    res.set("Cache-Control", "public, max-age=86400");
    res.send(imgBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка сервера");
  }
});

homeApi.post("/buyHome", async (req, res) => {
  try {
    const { homeId, userId, price } = req.body;
    const user = await getUser(userId);

    if (user.balance < price) {
      return res.json({ message: "money" });
    }

    const home = await getHomeById(homeId);

    if (home.userId) {
      return res.json({ message: "home" });
    }

    const myHome = await getHomeByUserId(user.id);

    if (myHome) {
      return res.json({ message: "myHome" });
    }

    user.balance -= price;
    home.userId = user.id;
    await home.save();
    await user.save();
    return res.json({ message: "success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default homeApi;
