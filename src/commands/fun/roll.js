import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";

export default {
  callback: async (client, interaction, commandData) => {
    const sidesOption = commandData?.args[0];
    const sides =
      sidesOption && Number(sidesOption) > 1 ? Number(sidesOption) : 6;

    const result = Math.floor(Math.random() * sides) + 1;

    const embed = new EmbedBuilder()
      .setTitle("🎲 Dice Roll")
      .setDescription(`You rolled a **${result}** (${sides} sided dice)`)
      .setColor("#5865F2")
      .setFooter({
        text: `Requested by ${commandData.author.tag}`,
        iconURL: commandData.author.displayAvatarURL({ dynamic: true }),
      });

    await interaction.reply({ embeds: [embed] });
  },
  name: "roll",
  description: "Roll a dice with an optional number of sides (default is 6).",
  devOnly: false,
  testOnly: false,
  options: [
    {
      name: "sides",
      description: "Number of sides on the dice.",
      type: ApplicationCommandOptionType.Integer,
      required: false,
    },
  ],
};
