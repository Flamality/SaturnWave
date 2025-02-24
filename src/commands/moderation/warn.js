import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import ms from "ms";
import { default as prettyMS } from "pretty-ms";
import {
  commandFollowupSuccess,
  messageUser,
  modActionDM,
  modActionFollowup,
  modActionFollowupFail,
  modActionMessage,
} from "../../utils/userEvents.js";
import { Server } from "../../models/Settings.js";

export default {
  callback: async (client, interaction, commandData) => {
    console.log(commandData.args);
    const isCommand = interaction.isCommand?.();
    let targetUID = commandData.args[0];

    let reason = commandData.args.slice(1).join(" ") || "No reason provided.";
    if (interaction.reference?.messageId) {
      const repliedMessage = await interaction.channel.messages.fetch(
        interaction.reference.messageId
      );
      const repliedUserId = repliedMessage.author.id;
      targetUID = repliedUserId;
      reason = commandData.args.join(" ") || "No reason provided.";
    }

    if (isCommand) await interaction.deferReply();
    let targetUser;
    try {
      targetUser = await interaction.guild.members.fetch(targetUID);
    } catch (error) {
      await modActionMessage({
        interaction,
        success: false,
        action: "Warn",
        actionLine: "Cannot find user.",
      });
      return;
    }

    // 🤖 Prevent muting bots
    if (targetUser.user.bot) {
      await modActionMessage({
        interaction,
        success: false,
        action: "Warn",
        actionLine: "Cannot warn bot.",
      });
      return;
    }

    // 🔑 Role hierarchy checks
    const botMember = await interaction.guild.members.fetchMe();
    const targetUserRolePosition = targetUser.roles.highest.position;
    const requestUserRolePosition = interaction.member.roles.highest.position;
    const botRolePosition = botMember.roles.highest.position;

    if (targetUserRolePosition >= requestUserRolePosition) {
      await modActionMessage({
        interaction,
        success: false,
        action: "Warn",
        actionLine: "You cannot warn this user.",
      });
      return;
    }

    if (targetUserRolePosition >= botRolePosition) {
      await modActionMessage({
        interaction,
        success: false,
        action: "Warn",
        actionLine: "I cannot warn this user.",
      });
      return;
    }

    try {
      const dmStatus = await modActionDM({
        client,
        interaction,
        userID: targetUser.id,
        action: "Warn",
        actionLine: "warnned",
        reason: reason,
        expires: Date.now() + 2.592e9,
      });
      await modActionMessage({
        interaction,
        success: true,
        action: "Warn",
        actionLine: `Warned ${targetUser}`,
        reason: reason,
        expires: Date.now() + 2.592e9,
        dmStatus,
      });
      await Server.addCase({
        serverID: interaction.guild.id,
        userID: targetUser.id,
        type: "warn",
        reason: reason,
        expires: Date.now() + 2.592e9,
      });
    } catch (error) {
      console.error("There was an error when muting:", error);
      await modActionMessage({
        interaction,
        success: false,
        action: "Warn",
        actionLine: "Unknown error occurred while executing this command.",
      });
    }
  },

  name: "warn",
  description: "Warn a user!",
  devOnly: false,
  testOnly: false,
  permissionsRequired: [PermissionFlagsBits.ModerateMembers],
  botPermissionsRequired: [PermissionFlagsBits.ModerateMembers],
  options: [
    {
      name: "target",
      description: "The user to warn.",
      required: true,
      type: ApplicationCommandOptionType.User,
    },
    {
      name: "reason",
      description: "The reason to warn.",
      required: false,
      type: ApplicationCommandOptionType.String,
    },
  ],
};
