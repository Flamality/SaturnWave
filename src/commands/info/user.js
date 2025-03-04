import { EmbedBuilder } from "discord.js";

export default {
  callback: async (client, interaction, commandData) => {
    const user = commandData.author;
    if (!user) {
      return interaction.reply({
        content: "Could not retrieve the user information.",
        ephemeral: true,
      });
    }

    const member = commandData.guild.members.cache.get(user.id);
    const embed = new EmbedBuilder()
      .setTitle(`User Info - ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: "User ID", value: user.id, inline: true },
        { name: "Username", value: user.username, inline: true },
        {
          name: "Discriminator",
          value: `#${user.discriminator}`,
          inline: true,
        },
        {
          name: "Created At",
          value: `<t:${Math.floor(user.createdAt.getTime() / 1000)}:F>`,
          inline: true,
        },
        member && member.joinedAt
          ? {
              name: "Joined Server At",
              value: `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:F>`,
              inline: true,
            }
          : null
      )
      .setColor("#5865F2")
      .setFooter({
        text: `Requested by ${user.tag}`,
        iconURL: user.displayAvatarURL({ dynamic: true }),
      });

    await interaction.reply({ embeds: [embed] });
  },
  name: "user",
  description: "Get info about the user.",
  devOnly: false,
  testOnly: false,
  options: [],
};
