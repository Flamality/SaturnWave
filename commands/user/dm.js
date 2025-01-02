import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("dm")
    .setDescription("Send an anonymous DM to a user.")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("The user to DM")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("Message to send")
        .setRequired(true)
    ),

  async execute(interaction) {
    const targetUser = interaction.options.getUser("target");
    const message = interaction.options.getString("message");

    if (!targetUser) {
      return interaction.reply("You need to mention a user to DM.");
    }

    if (!message) {
      return interaction.reply("You need to provide a message to send.");
    }

    try {
      // Prepare the anonymous DM embed
      const dmEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle("You have a new message!")
        .setDescription(message)
        .setFooter({ text: "This message was sent anonymously." })
        .setTimestamp();

      // Send the DM to the target user
      try {
        await targetUser.send({ embeds: [dmEmbed] });
        return interaction.reply({
          content: `Successfully sent an anonymous message to ${targetUser.tag}.`,
          ephemeral: true,
        });
      } catch (error) {
        console.error(`Could not DM the user ${targetUser.tag}:`, error);
        return interaction.reply({
          content: `Failed to send a message to ${targetUser.tag}. They might have DMs disabled.`,
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: "There was an error trying to send the DM.",
        ephemeral: true,
      });
    }
  },
};
