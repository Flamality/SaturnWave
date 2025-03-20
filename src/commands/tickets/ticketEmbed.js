import {
  EmbedBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
} from "discord.js";

export default {
  callback: async (client, interaction, commandData) => {
    const ticketEmbed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("🎟️ Create a Support Ticket 🎟️")
      .setDescription(
        `Need help in **${commandData.guild.name}**? Create a ticket to get assistance! Our support team will respond as soon as possible.`
      )
      .addFields(
        {
          name: "💬 How it works:",
          value:
            "Click the button below to create a ticket. A private thread will be created just for you to communicate with the servers support team.",
        },
        {
          name: "🔒 Privacy:",
          value:
            "Only you and the servers support team will have access to the ticket channel.",
        }
      )
      .setFooter({
        text: `We are here to assist you at ${commandData.guild.name}.`,
      });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("createticket")
        .setLabel("Create Ticket")
        .setStyle("Primary")
    );

    await interaction.channel.send({
      embeds: [ticketEmbed],
      components: [row],
    });
    try {
      await interaction.delete();
    } catch (error) {
      await interaction.reply({
        content: "Ticket embed created!",
        ephemeral: true,
      });
    }
  },
  name: "create-ticket-embed",
  description: "Create an embed for users to create tickets!",
  permissionsRequired: [PermissionFlagsBits.Administrator],
  alias: ["create-t-e"],
  botPermissionsRequired: [PermissionFlagsBits.ManageGuild],
  devOnly: false,
  testOnly: false,
  options: [],
};
