import { Level } from "../../models/Level.js";
import { Server } from "../../models/Settings.js";
import { getLevel, levelUp, xpForLevel } from "../../utils/levels.js";

function getRandomXp(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default async (client, message) => {
  if (!message.inGuild() || message.author.bot) return;

  const enabled = await Server.getSetting(
    Number(message.guild.id),
    "modules.levels"
  );
  if (!Boolean(enabled)) return;
  const prefix = await Server.getSetting(message.guild.id, "general.prefix");
  if (message.content.startsWith(prefix)) return;

  const min = await Server.getSetting(
    Number(message.guild.id),
    "levels.min-xp"
  );
  const max = await Server.getSetting(
    Number(message.guild.id),
    "levels.max-xp"
  );
  const baseXP = await Server.getSetting(
    Number(message.guild.id),
    "levels.base"
  );
  const multiplier = await Server.getSetting(
    Number(message.guild.id),
    "levels.multiplier"
  );
  const xp = getRandomXp(Number(min), Number(max));
  const userID = message.author.id;
  const guildID = message.guild.id;
  try {
    var newXp = xp;
    var oldXp = 0;
    var levelData = await Level.findOne({ userID, guildID });
    if (!levelData) {
      levelData = await Level.create({ userID, guildID, xp });
    } else {
      oldXp = levelData.xp;
      newXp = Number(levelData.xp) + Number(xp);
      levelData = await Level.update({ userID, guildID, xp: newXp });
    }
    if (levelUp(oldXp, newXp, baseXP, multiplier)) {
      await message.channel.send(
        `Congratulations, ${message.author}! You've reached level ${getLevel(
          levelData.xp
        )}!`
      );
    }
  } catch (error) {
    console.log("Error giving xp", error);
  }
};
