import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("levels")
    .setDescription("Manage levels ring."),
  async execute(interaction) {
    await interaction.reply(`Levels still under development.`);
  },
};
