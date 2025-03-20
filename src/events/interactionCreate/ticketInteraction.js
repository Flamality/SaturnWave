import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
} from "discord.js";
import { Server } from "../../models/Settings.js";
import { TicketSystem } from "../../models/Tickets.js";

export default async (client, interaction) => {
  if (!interaction.isButton()) return;

  const channel = interaction.channel;

  if (interaction.customId == "createticket") {
    try {
      const thread = await channel.threads.create({
        name: `Ticket - ${interaction.user.username}`,
        autoArchiveDuration: 60,
        reason: "Support Ticket Created",
        type: ChannelType.PrivateThread,
      });
      TicketSystem.createTicket(
        interaction.guild.id,
        thread.id,
        interaction.user.id
      );
      const tagUser = await thread.send({
        content: `<@${interaction.user.id}>`,
      });
      await tagUser.delete();
      const roles = await Server.getSetting(
        interaction.guild.id,
        "tickets.support-roles"
      );
      const tagRoles = await Server.getSetting(
        interaction.guild.id,
        "tickets.tag-support-roles"
      );
      console.log(Boolean(tagRoles));
      if (roles.length > 0 && Boolean(tagRoles)) {
        const roleArray = roles.split(",");

        const rolesToSend = roleArray
          .map((role) => `<@&${role.trim()}>`)
          .join(" ");

        const staffTag = await thread.send({
          content: rolesToSend,
        });

        await staffTag.delete();
      }

      const ticketEmbed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("🎟️ Support Ticket Created 🎟️")
        .setDescription(
          `Hello ${interaction.user.username}, your support ticket has been created! Please describe your issue, and our team will assist you as soon as possible.`
        )
        .setFooter({ text: "Thank you for reaching out to support!" });

      await thread.send({ embeds: [ticketEmbed] });

      const actionRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("closeticket")
          .setLabel("Close Ticket")
          .setStyle(ButtonStyle.Primary)
      );

      await thread.send({
        content: "Click below to manage your support ticket.",
        components: [actionRow],
      });

      await interaction.reply({
        content: `Your support ticket has been created! Please check the new thread.\n${thread.url}`,
        ephemeral: true,
      });
    } catch (error) {
      console.error("Error creating ticket thread:", error);
      await interaction.reply({
        content:
          "There was an error creating your support ticket. Please try again later.",
        ephemeral: true,
      });
    }
  } else if (interaction.customId == "closeticket") {
    const actionRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("confirmcloseticket")
        .setLabel("Close Ticket")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("cancelcloseticket")
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({
      content: "Are you sure you want to close this ticket?",
      components: [actionRow],
      ephemeral: true,
    });
  } else if (interaction.customId == "confirmcloseticket") {
    const thread = interaction.channel;
    await interaction.reply({
      content: `The ticket has been closed by ${interaction.user} If you need further assistance, please open a new ticket.`,
      ephemeral: false,
    });

    const actionRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("reopenticket")
        .setLabel("Re-open Ticket")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("deleteticket")
        .setLabel("Delete Ticket")
        .setStyle(ButtonStyle.Danger)
    );

    await thread.send({
      content: "Click below to manage your support ticket.",
      components: [actionRow],
    });
    await thread.setArchived(true);
    await TicketSystem.updateTicketStatus(
      interaction.guild.id,
      thread.id,
      "closed"
    );
  } else if (interaction.customId == "cancelcloseticket") {
    await interaction.message.delete();
  } else if (interaction.customId == "deleteticket") {
    const actionRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("confirmdeleteticket")
        .setLabel("Confirm Delete")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("canceldeleteticket")
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({
      content:
        "Are you sure you want to delete this ticket? This action cannot be undone.",
      components: [actionRow],
      ephemeral: true,
    });
  } else if (interaction.customId == "confirmdeleteticket") {
    const thread = interaction.channel;
    if (thread.isThread()) {
      await interaction.reply({
        content: "Your support ticket has been deleted.",
        ephemeral: true,
      });
      await thread.delete("Ticket deleted by user request.");
    }
    await TicketSystem.updateTicketStatus(
      interaction.guild.id,
      thread.id,
      "deleted"
    );
  } else if (interaction.customId == "canceldeleteticket") {
    await interaction.reply({
      content: "Ticket deletion has been canceled.",
      ephemeral: true,
    });
  } else if (interaction.customId == "reopenticket") {
    const thread = interaction.channel;
    interaction.message.delete();
    await thread.setArchived(false);
    await TicketSystem.updateTicketStatus(
      interaction.guild.id,
      thread.id,
      "open"
    );
  }
};
