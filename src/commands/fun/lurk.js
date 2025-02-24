import { EmbedBuilder } from "discord.js";

export default {
  callback: async (client, interaction, commandData) => {
    const user = commandData.author;

    const embed = new EmbedBuilder()
      .setDescription(`${user} is lurking... 👀`)
      .setColor("#2F3136")
      .setFooter({
        text: `Requested by ${user.tag}`,
        iconURL: user.displayAvatarURL({ dynamic: true }),
      });

    await interaction.reply({ embeds: [embed] });
  },
  name: "lurk",
  description: "Let everyone know you're lurking. 👀",
  devOnly: false,
  testOnly: false,
  options: [],
};
