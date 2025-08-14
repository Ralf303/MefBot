import { Mining } from "../../db/models.js";

const getMineInfo = async () => {
  const mineInfo = await Mining.findOne({
    where: {
      id: 1,
    },
  });

  return mineInfo;
};

export { getMineInfo };
