import { EmbedBuilder } from "discord.js";

export default {
  callback: async (client, interaction, commandData) => {
    const clientId = client.user.id;
    const permissions = "8";
    const inviteLink = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&scope=bot%20applications.commands`;

    const embed = new EmbedBuilder()
      .setTitle("Invite Me!")
      .setDescription(
        `[Click here to invite the bot to your server!](${inviteLink})`
      )
      .setColor("#5865F2")
      .setFooter({
        text: `Requested by ${commandData.author.tag}`,
        iconURL: commandData.author.displayAvatarURL({ dynamic: true }),
      });

    await interaction.reply({ embeds: [embed] });
  },
  name: "invite",
  description: "Get the bot's invite link.",
  devOnly: false,
  testOnly: false,
  options: [],
};
