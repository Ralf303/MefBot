import { Active, User } from "../../db/models.js";

class ActiveService {
  async updateUserActivity(userId, chatId) {
    try {
      const userActivity = await Active.findOne({
        where: { userId: userId, chatId: chatId },
      });

      if (userActivity) {
        userActivity.day += 1;
        userActivity.week += 1;
        userActivity.month += 1;

        await userActivity.save();
      } else {
        await Active.create({
          userId: userId,
          chatId: chatId,
          day: 1,
          week: 1,
          month: 1,
        });
      }
    } catch (error) {
      console.error("Error updating user activity:", error);
    }
  }

  async getTopDayUsers(chatId) {
    try {
      const topUsers = await Active.findAll({
        where: { chatId: chatId },
        order: [["day", "DESC"]],
        limit: 3,
        include: {
          model: User,
        },
      });

      return topUsers;
    } catch (error) {
      console.error("Error getting top 3 users by activity:", error);
    }
  }

  async getTopWeekUsers(chatId) {
    try {
      const topUsers = await Active.findAll({
        where: { chatId: chatId },
        order: [["week", "DESC"]],
        limit: 3,
        include: {
          model: User,
        },
      });

      return topUsers;
    } catch (error) {
      console.error("Error getting top 3 users by activity:", error);
    }
  }

  async getTopMonthUsers(chatId) {
    try {
      const topUsers = await Active.findAll({
        where: { chatId: chatId },
        order: [["month", "DESC"]],
        limit: 3,
        include: {
          model: User,
        },
      });

      return topUsers;
    } catch (error) {
      console.error("Error getting top 3 users by activity:", error);
    }
  }

  async resetDayValues(chatId) {
    try {
      await Active.update({ day: 0 }, { where: { chatId } });
    } catch (error) {
      console.error("Error resetting day values:", error);
    }
  }

  async resetWeekValues(chatId) {
    try {
      await Active.update({ week: 0 }, { where: { chatId } });
    } catch (error) {
      console.error("Error resetting Week values:", error);
    }
  }

  async resetMonthValues(chatId) {
    try {
      await Active.update({ month: 0 }, { where: { chatId } });
    } catch (error) {
      console.error("Error resetting Month values:", error);
    }
  }
}

export default new ActiveService();
