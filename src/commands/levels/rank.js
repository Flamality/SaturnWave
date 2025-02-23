import { AttachmentBuilder } from "discord.js";
import createRankCard, { getLevel, xpForLevel } from "../../utils/levels.js";
import { Level } from "../../models/Level.js";

export default {
  callback: async (client, interaction) => {
    await interaction.deferReply();
    const userID = interaction.user.id;
    const guildID = interaction.guild.id;
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
      username: interaction.user.username,
      xp: levelData.xp,
      level,
      neededXP,
      lastLevelXP,
      avatarHash: interaction.user.avatar,
      userID,
      serverRank,
    };
    try {
      const rankCardBuffer = await createRankCard(userData);

      const attachment = new AttachmentBuilder(rankCardBuffer, {
        name: "rankcard.png",
      });
      interaction.editReply({ files: [attachment] });
    } catch (err) {
      console.error("Error creating rank card:", err);
      interaction.editReply("There was an error creating your rank card!");
    }
  },
  name: "rank",
  description: "Check your or another users rank!",
  devOnly: false,
  testOnly: false,
  options: [],
};
