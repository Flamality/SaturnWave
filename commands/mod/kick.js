import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDefaultMemberPermissions(PermissionFlagsBits.kick)
    .setDescription("Kicks a user from the server.")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("The user to kick")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for kicking")
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
      return interaction.reply("You need to mention a user to kick.");
    }

    // Check if the user has the necessary permission to kick
    if (!interaction.member.permissions.has("KICK_MEMBERS")) {
      return interaction.reply("You don't have permission to kick members.");
    }

    try {
      // Make sure the target user is not the bot or the command author
      if (targetUser.id === interaction.client.user.id) {
        return interaction.reply("I cannot kick myself!");
      }
      if (targetUser.id === interaction.user.id) {
        return interaction.reply("You cannot kick yourself!");
      }

      // Prepare the embed
      const kickEmbed = new EmbedBuilder()
        .setColor(0x990000)
        .setTitle(`Kicked`)
        .setDescription(
          `You have been kicked from the server **${interaction.guild.name}**`
        )
        .addFields(
          { name: "Reason", value: reason, inline: true },
          { name: "Kicked By", value: interaction.user.tag, inline: true },
          {
            name: "Proof (If included):",
            value: proof ? "↓" : "No proof provided.",
            inline: false,
          }
        )
        .setTimestamp()
        .setFooter({ text: "Action executed" });

      if (proof) {
        kickEmbed.setImage(proof.url); // Attach the proof image if provided
      }

      // DM the user who is kicked
      try {
        await targetUser.send({ embeds: [kickEmbed] });
      } catch (error) {
        console.error(`Could not DM the user ${targetUser.tag}:`, error);
        // If DM fails, notify the user in the server (if the target user has DMs off)
        await interaction.followUp({
          content: `Could not send a DM to ${targetUser.tag}. They have DMs off.`,
          ephemeral: true,
        });
      }

      // DM the user who executed the kick command
      const executeEmbed = new EmbedBuilder()
        .setColor(0x0b5394)
        .setTitle("User Kicked Successfully")
        .setDescription(
          `You successfully kicked **${targetUser.tag}** from the server **${interaction.guild.name}**`
        )
        .addFields(
          { name: "Reason", value: reason, inline: true },
          { name: "Kicked User", value: targetUser.tag, inline: true },
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
        await member.kick(reason);
        return interaction.reply({
          content: `${targetUser.tag} has been kicked from the server.`,
          ephemeral: true,
        });
      } catch (error) {
        return interaction.reply({
          content: `${targetUser.tag} could not be kicked.`,
          ephemeral: true,
        });
      }
      await interaction.reply(
        `${targetUser.tag} has been kicked for the reason: "${reason}"`
      );
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: "There was an error trying to kick that user.",
        ephemeral: true,
      });
    }
  },
};
