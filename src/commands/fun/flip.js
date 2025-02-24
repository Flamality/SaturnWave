import { EmbedBuilder } from "discord.js";

export default {
  callback: async (client, interaction, commandData) => {
    const result = Math.random() < 0.5 ? "Heads" : "Tails";

    const embed = new EmbedBuilder()
      .setTitle("🪙 Coin Flip")
      .setDescription(`The coin landed on **${result}**!`)
      .setColor("#FEE75C")
      .setFooter({
        text: `Requested by ${commandData.author.tag}`,
        iconURL: commandData.author.displayAvatarURL({ dynamic: true }),
      });

    await interaction.reply({ embeds: [embed] });
  },
  name: "flip",
  description: "Flip a coin.",
  devOnly: false,
  testOnly: false,
  options: [],
};
