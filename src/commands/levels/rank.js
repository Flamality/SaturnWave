import { ApplicationCommandOptionType, AttachmentBuilder } from "discord.js";
import createRankCard, { getLevel, xpForLevel } from "../../utils/levels.js";
import { Level } from "../../models/Level.js";
import { Server } from "../../models/Settings.js";

export default {
  callback: async (client, interaction, commandData) => {
    const enabled = await Server.getSetting(
      Number(interaction.guild.id),
      "modules.levels"
    );
    if (!enabled) {
      await interaction.reply("Level module not enabled.");
      return;
    }
    console.log(enabled);
    const userID = commandData.args[0] || commandData.author.id;
    const guildID = commandData.guild.id;
    let levelData = { xp: 0 };
    try {
      const data = await Level.findOne({ userID, guildID });
      if (data.xp) {
        levelData = data;
      }
    } catch (error) {}
    const baseXP = await Server.getSetting(
      Number(interaction.guild.id),
      "levels.base"
    );
    const multiplier = await Server.getSetting(
      Number(interaction.guild.id),
      "levels.multiplier"
    );
    const serverRank = await Level.getRank({ userID, guildID });
    const level = getLevel(levelData.xp, baseXP, multiplier);
    const neededXP = xpForLevel(level, baseXP, multiplier);
    var lastLevelXP = xpForLevel(level - 1, baseXP, multiplier);
    if (level == 0) {
      lastLevelXP = 0;
    }
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
