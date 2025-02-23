import { Level } from "../../models/Level.js";
import { getLevel, levelUp, xpForLevel } from "../../utils/levels.js";

function getRandomXp(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default async (client, message) => {
  if (!message.inGuild() || message.author.bot) return;

  const xp = getRandomXp(5, 15);
  const userID = message.author.id;
  const guildID = message.guild.id;
  try {
    let newXp = xp;
    let oldXp = 0;
    let levelData = await Level.findOne({ userID, guildID });
    if (!levelData) {
      levelData = await Level.create({ userID, guildID, xp });
    } else {
      oldXp = levelData.xp;
      newXp = Number(levelData.xp) + xp;
      levelData = await Level.update({ userID, guildID, xp: newXp });
    }
    if (levelUp(oldXp, newXp)) {
      await message.channel.send(
        `Congratulations, ${message.author}! You've reached level ${
          levelData.level + 1
        }!`
      );
    }
  } catch (error) {
    console.log("Error giving xp", error);
  }
};
