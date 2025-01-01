import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Bans a user from the server.")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("The user to ban")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for ban")
        .setRequired(false)
    )
    .addAttachmentOption((option) =>
      option
        .setName("proof")
        .setDescription("Attach proof of the violation")
        .setRequired(false)
    ),

  async execute(interaction) {
    const targetUser = interaction.options.getUser("target");
    const reason =
      interaction.options.getString("reason") || "No reason provided.";
    const proof = interaction.options.getAttachment("proof");

    if (!targetUser) {
      return interaction.reply("You need to mention a user to ban.");
    }

    // Check if the user has the necessary permission to ban
    if (!interaction.member.permissions.has("BAN_MEMBERS")) {
      return interaction.reply("You don't have permission to ban members.");
    }

    try {
      // Make sure the target user is not the bot or the command author
      if (targetUser.id === interaction.client.user.id) {
        return interaction.reply("I cannot ban myself!");
      }
      if (targetUser.id === interaction.user.id) {
        return interaction.reply("You cannot ban yourself!");
      }

      // Prepare the embed
      const banEmbed = new EmbedBuilder()
        .setColor(0x990000)
        .setTitle(`Banned`)
        .setDescription(
          `You have been banned from the server **${interaction.guild.name}**`
        )
        .addFields(
          { name: "Reason", value: reason, inline: true },
          { name: "Banned By", value: interaction.user.tag, inline: true },
          {
            name: "Proof (If included):",
            value: proof ? "↓" : "No proof provided.",
            inline: false,
          }
        )
        .setTimestamp()
        .setFooter({ text: "Action executed" });

      if (proof) {
        banEmbed.setImage(proof.url); // Attach the proof image if provided
      }

      // DM the user who is banned
      try {
        await targetUser.send({ embeds: [banEmbed] });
      } catch (error) {
        console.error(`Could not DM the user ${targetUser.tag}:`, error);
        // If DM fails, notify the user in the server (if the target user has DMs off)
        await interaction.followUp({
          content: `Could not send a DM to ${targetUser.tag}. They have DMs off.`,
          ephemeral: true,
        });
      }

      // DM the user who executed the ban command
      const executeEmbed = new EmbedBuilder()
        .setColor(0x0b5394)
        .setTitle("User Banned Successfully")
        .setDescription(
          `You successfully banned **${targetUser.tag}** from the server **${interaction.guild.name}**`
        )
        .addFields(
          { name: "Reason", value: reason, inline: true },
          { name: "Banned User", value: targetUser.tag, inline: true },
          {
            name: "Proof (If included):",
            value: proof ? "↓" : "No proof provided.",
            inline: false,
          }
        )
        .setTimestamp()
        .setFooter({ text: "Action executed" });

      if (proof) {
        executeEmbed.setImage(proof.url); // Attach the proof image if provided
      }

      try {
        await interaction.user.send({ embeds: [executeEmbed] });
      } catch (error) {
        console.error(
          `Could not DM the executor ${interaction.user.tag}:`,
          error
        );
        // Notify in the server if DM fails
        await interaction.followUp({
          content: `Could not send a DM to you, ${interaction.user.tag}. Please check your DM settings.`,
          ephemeral: true,
        });
      }

      try {
        const member = await interaction.guild.members.fetch(targetUser.id);
        await member.ban(reason);
        return interaction.reply({
          content: `${targetUser.tag} has been banned from the server.`,
          ephemeral: true,
        });
      } catch (error) {
        return interaction.reply({
          content: `${targetUser.tag} could not be banned.`,
          ephemeral: true,
        });
      }
      await interaction.reply(
        `${targetUser.tag} has been banned for the reason: "${reason}"`
      );
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: "There was an error trying to ban that user.",
        ephemeral: true,
      });
    }
  },
};
