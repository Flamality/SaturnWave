import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("flip")
    .setDescription("Flip a coin!"),
  async execute(interaction) {
    await interaction.reply(Math.random() < 0.5 ? "Heads!" : "Tails!");
  },
};
