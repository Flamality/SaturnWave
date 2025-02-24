import { EmbedBuilder } from "discord.js";

export default {
  callback: async (client, interaction, commandData) => {
    if (!client.uptime) {
      return interaction.reply({
        content: "Could not retrieve the bot's uptime.",
        ephemeral: true,
      });
    }

    const totalSeconds = Math.floor(client.uptime / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    const embed = new EmbedBuilder()
      .setTitle("Bot Uptime")
      .setDescription(`The bot has been running for **${uptimeString}**.`)
      .setColor("#57F287")
      .setFooter({
        text: `Requested by ${commandData.author.tag}`,
        iconURL: commandData.author.displayAvatarURL({ dynamic: true }),
      });

    await interaction.reply({ embeds: [embed] });
  },
  name: "uptime",
  description: "Displays the bot's uptime.",
  devOnly: false,
  testOnly: false,
  options: [],
};
