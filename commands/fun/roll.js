import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("roll")
    .setDescription("Roll a dice or generate a random number.")
    .addIntegerOption((option) =>
      option
        .setName("sides")
        .setDescription("The number of sides on the die")
        .setRequired(false)
        .setMinValue(2)
    ),

  async execute(interaction) {
    const sides = interaction.options.getInteger("sides") || 6; // Default to 6 sides if no input
    const result = Math.floor(Math.random() * sides) + 1;
    return interaction.reply(`You rolled a ${result} on a ${sides}-sided die!`);
  },
};
