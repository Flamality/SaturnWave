import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("uptime")
    .setDescription("Shows how long the bot has been online."),

  async execute(interaction) {
    const uptime = process.uptime(); // Get the uptime in seconds
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    return interaction.reply(
      `I have been online for ${hours} hours, ${minutes} minutes, and ${seconds} seconds.`
    );
  },
};
