import { Router } from "express";

import {
  getHomeImg,
  getHomeById,
  getHomeByUserId,
} from "../modules/home-module/home-service.js";
import { getUser } from "../db/functions.js";
import { Home } from "../db/models.js";

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
