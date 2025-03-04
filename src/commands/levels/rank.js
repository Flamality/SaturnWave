import { ApplicationCommandOptionType, AttachmentBuilder } from "discord.js";
import createRankCard, { getLevel, xpForLevel } from "../../utils/levels.js";
import { Level } from "../../models/Level.js";

export default {
  callback: async (client, interaction, commandData) => {
    const userID = commandData.args[0] || commandData.author.id;
    console.log(userID);
    const guildID = commandData.guild.id;
    let levelData = { xp: 0 };
    try {
      const data = await Level.findOne({ userID, guildID });
      if (data.xp) {
        levelData = data;
      }
    } catch (error) {}
    const serverRank = await Level.getRank({ userID, guildID });
    const level = getLevel(levelData.xp);
    const neededXP = xpForLevel(level);
    const lastLevelXP = xpForLevel(level - 1);
    const userData = {
      username: commandData.author.username,
      xp: levelData.xp,
      level,
      neededXP,
      lastLevelXP,
      avatarHash: commandData.author.avatar,
      userID,
      serverRank,
    };
    try {
      const rankCardBuffer = await createRankCard(userData);

      const attachment = new AttachmentBuilder(rankCardBuffer, {
        name: "rankcard.png",
      });
      interaction.reply({ files: [attachment] });
    } catch (err) {
      console.error("Error creating rank card:", err);
      interaction.reply("There was an error creating your rank card!");
    }
  },
  name: "rank",
  description: "Check your or another users rank!",
  alias: ["r"],
  devOnly: false,
  testOnly: false,
  options: [
    {
      name: "user",
      type: ApplicationCommandOptionType.User,
      description: "The user whose rank you want to check.",
      required: false,
    },
  ],
};
