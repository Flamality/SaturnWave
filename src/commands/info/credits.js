import { EmbedBuilder } from "discord.js";

export default {
  callback: async (client, interaction, commandData) => {
    const embed = new EmbedBuilder()
      .setTitle("Credits")
      .setDescription(
        `This bot's code was made by Flamality, view the repo [here](https://github.com/Flamality/SaturnWave)`
      )
      .setColor("#5865F2")
      .setFooter({
        text: `Requested by ${commandData.author.tag}`,
        iconURL: commandData.author.displayAvatarURL({ dynamic: true }),
      });

    await interaction.reply({ embeds: [embed] });
  },
  name: "credits",
  description: "Get the bot's credits.",
  devOnly: false,
  testOnly: false,
  options: [],
};
