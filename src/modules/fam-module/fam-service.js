const { getUser } = require("../../db/functions");
const { Family, Bafs, FamMember, User } = require("../../db/models");

const getFamilyByFamId = async (familyId) => {
  try {
    return await Family.findOne({
      where: { id: familyId },
      include: Bafs,
    });
  } catch (error) {
    console.log(error);
  }
};

const getCheckFamily = async () => {
  try {
    return await Family.findAll({
      where: { check: true },
    });
  } catch (error) {
    console.log(error);
  }
};

const getTopFams = async (count) => {
  try {
    const topFams = await Family.findAll({
      where: {},
      order: [["reputation", "DESC"]],
      limit: count,
    });

    return topFams;
  } catch (error) {
    console.error(error);
  }
};

const getFamilyByUserId = async (userId) => {
  try {
    const user = await User.findOne({
      where: { chatId: String(userId) },
    });
    const isMember = await FamMember.findOne({
      where: { userId: user.chatId },
    });

    if (!isMember) return null;

    return await Family.findOne({
      where: { id: isMember.familyId },
      include: Bafs,
    });
  } catch (error) {
    console.log(error);
  }
};

const createFamily = async (name, creatorId) => {
  try {
    const newFamily = await Family.create({
      name: name,
      owner: String(creatorId),
    });
    await Bafs.create({
      familyId: newFamily.id,
    });

    const creator = await addUserToFamily(creatorId, newFamily.id);
    creator.rang = 5;
    await creator.save();
    return newFamily;
  } catch (error) {
    console.log(error);
  }
};

const addUserToFamily = async (userId, familyId) => {
  try {
    return await FamMember.create({
      userId: userId,
      familyId: familyId,
    });
  } catch (error) {
    console.log(error);
  }
};

const getFamUsers = async (familyId) => {
  try {
    return await FamMember.findAll({
      where: { familyId: familyId },
    });
  } catch (error) {
    console.log(error);
  }
};

const getRang = async (userId, familyId) => {
  try {
    const user = await FamMember.findOne({
      where: {
        userId: userId,
        familyId: familyId,
      },
    });

    return user.rang;
  } catch (error) {
    console.log(error);
  }
};

const removeUserFromFamily = async (userId, familyId) => {
  try {
    await FamMember.destroy({
      where: {
        userId: userId,
        familyId: familyId,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

const getMainUser = async (familyId) => {
  try {
    const main = await FamMember.findOne({
      where: {
        familyId: familyId,
        rang: 5,
      },
    });
    const user = await getUser(main.userId);
    return user;
  } catch (error) {
    console.log(error);
  }
};

const getDeputies = async (familyId) => {
  try {
    return await FamMember.findAll({
      where: {
        familyId: familyId,
        rang: 4,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

const setRang = async (userId, familyId, rang) => {
  try {
    const member = await FamMember.findOne({
      where: {
        userId: userId,
        familyId: familyId,
      },
    });
    member.rang = rang;
    await member.save();
  } catch (error) {
    console.log(error);
  }
};

const getBufsText = (fam) => {
  return `Улучшения семьи «${fam.name}»:

1) +250 старок к награде за актив(${fam.Baf.active}/5)

2) +1 к удаче(${fam.Baf.luck}/5)

3) +1% к успешному крафту(${fam.Baf.craft}/5)

4) +100 старок к каждому сбору фермы(${fam.Baf.farm}/5)

5) +200 старок к награде за ввод капчи(${fam.Baf.capcha}/5)

6) +500 старок за приглашение юзера в чат(${fam.Baf.invite}/5)

7) +1 открытие кейса за одно открытие(${fam.Baf.case}/2)

Каждое улучшение стоит 1.000.000 старок ⭐️

📖 Семья купить улучшение {id}`;
};

const getFamilyMembers = async (familyId, famName) => {
  try {
    const familyMembers = await FamMember.findAll({
      where: { familyId },
      include: [
        {
          model: User,
          required: true,
        },
      ],
      order: [["rang", "DESC"]],
    });

    let responseString = `Родственники семьи  «${famName}»\n\n`;

    familyMembers.forEach((member, index) => {
      const user = member.user;
      responseString += `• <a href="tg://openmessage?user_id=${user.chatId}">${user.firstname}</a> (${member.rang})\n`;
    });

    return responseString;
  } catch (error) {
    console.error("Ошибка при получении членов семьи:", error);
  }
};

const deleteFam = async (familyId) => {
  try {
    await FamMember.destroy({
      where: { familyId: familyId },
    });

    await Bafs.destroy({
      where: { familyId: familyId },
    });

    await Family.destroy({
      where: { id: familyId },
    });
  } catch (error) {
    console.log(error);
  }
};

const flushReputation = async () => {
  try {
    await Family.update({ reputation: 0 }, { where: {} });
  } catch (error) {
    console.log(error);
  }
};
module.exports = {
  getFamilyByFamId,
  getFamilyByUserId,
  addUserToFamily,
  removeUserFromFamily,
  createFamily,
  getRang,
  getCheckFamily,
  getFamUsers,
  getMainUser,
  getDeputies,
  setRang,
  getBufsText,
  getTopFams,
  getFamilyMembers,
  deleteFam,
  flushReputation,
};
