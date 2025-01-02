import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Get help with the bot"),
  async execute(interaction) {
    await interaction.reply("https://saturnwave.flamality.xyz/docs");
  },
};
