const { Router } = require("express");

const {
  getHomeImg,
  getHomeById,
  getHomeByUserId,
} = require("../modules/home-module/home-service");
const { getUser } = require("../db/functions");
const { Home } = require("../db/models");
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

homeApi.get("/getHomes", async (req, res) => {
  try {
    console.log(`Запрос на получение домов поступил`);
    const startTime = new Date().getTime();

    const { id } = req.query;
    const homesWithImages = await getHomeImg(id);

    console.log(
      `Дома получены и отправлены, ИТОГОВОЕ ВРЕМЯ ${
        new Date().getTime() - startTime
      } мс `
    );

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

module.exports = homeApi;
