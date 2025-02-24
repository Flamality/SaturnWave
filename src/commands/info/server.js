import { EmbedBuilder } from "discord.js";

export default {
  callback: async (client, interaction, commandData) => {
    const guild = commandData.guild;

    if (!guild) {
      return interaction.reply({
        content: "Could not retrieve the server information.",
        ephemeral: true,
      });
    }

    const { name, memberCount, ownerId, createdAt, id } = guild;
    const owner = await client.users.fetch(ownerId);

    const embed = new EmbedBuilder()
      .setTitle(`Server Info - ${name}`)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        { name: "Server ID", value: id, inline: true },
        {
          name: "Owner",
          value: owner ? `${owner.tag}` : "Unknown",
          inline: true,
        },
        { name: "Member Count", value: `${memberCount}`, inline: true },
        {
          name: "Created At",
          value: `<t:${Math.floor(createdAt.getTime() / 1000)}:F>`,
          inline: true,
        }
      )
      .setColor("#5865F2")
      .setFooter({
        text: `Requested by ${commandData.author.username}`,
        iconURL: commandData.author.displayAvatarURL({ dynamic: true }),
      });

    await interaction.reply({ embeds: [embed] });
  },
  name: "server",
  description: "Get info about the server.",
  devOnly: false,
  testOnly: false,
  options: [],
};
