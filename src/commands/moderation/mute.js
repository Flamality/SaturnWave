import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import ms from "ms";
import { default as prettyMS } from "pretty-ms";
import {
  commandFollowupSuccess,
  modActionDM,
  modActionFollowup,
  modActionFollowupFail,
  modActionMessage,
} from "../../utils/userEvents.js";
import { Server } from "../../models/Settings.js";

export default {
  callback: async (client, interaction, commandData) => {
    const isCommand = interaction.isCommand?.();
    let targetUID = commandData.args[0];
    let duration = commandData.args[1];

    let reason = commandData.args.slice(2).join(" ") || "No reason provided.";
    if (interaction.reference?.messageId) {
      const repliedMessage = await interaction.channel.messages.fetch(
        interaction.reference.messageId
      );
      const repliedUserId = repliedMessage.author.id;
      targetUID = repliedUserId;
      duration = commandData.args[0];
      reason = commandData.args.slice(1).join(" ") || "No reason provided.";
    }

    if (isCommand) await interaction.deferReply();
    let targetUser;
    try {
      targetUser = await interaction.guild.members.fetch(targetUID);
    } catch (error) {
      await modActionMessage({
        interaction,
        success: false,
        action: "Mute",
        actionLine: "Cannot find user.",
      });
      return;
    }

    // 🤖 Prevent muting bots
    if (targetUser.user.bot) {
      await modActionMessage({
        interaction,
        success: false,
        action: "Mute",
        actionLine: "Cannot mute a bot.",
      });
      return;
    }

    // ⏲️ Duration checks
    let msDuration = false;
    try {
      msDuration = ms(duration);
    } catch (error) {
      await modActionMessage({
        interaction,
        success: false,
        action: "Mute",
        actionLine: "Invalid time format.",
      });
      return;
    }
    if (isNaN(msDuration)) {
      await modActionMessage({
        interaction,
        success: false,
        action: "Mute",
        actionLine: "Invalid time format.",
      });
      return;
    }
    if (msDuration < 5000) {
      await modActionMessage({
        interaction,
        success: false,
        action: "Mute",
        actionLine: "Duration cannot be less than 5 seconds.",
      });
      return;
    }

    if (msDuration > 2.419e9) {
      await modActionMessage({
        interaction,
        success: false,
        action: "Mute",
        actionLine: "Duration cannot exceed 28 days.",
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
        action: "Mute",
        actionLine: "You cannot mute this user.",
      });
      return;
    }

    if (targetUserRolePosition >= botRolePosition) {
      await modActionMessage({
        interaction,
        success: false,
        action: "Mute",
        actionLine: "I cannot mute this user.",
      });
      return;
    }

    // 🔇 Apply mute
    try {
      await targetUser.timeout(msDuration, reason);
      const dmStatus = await modActionDM({
              client,
              interaction,
              userID: targetUser.id,
              action: "Mute",
              actionLine: "muted",
              reason: reason,
              duration:  prettyMS(msDuration, { verbose: true }),
            });
      await modActionMessage({
        interaction,
        success: true,
        action: "Mute",
        actionLine: `Muted ${targetUser}`,
        reason,
        duration: prettyMS(msDuration, { verbose: true }),
        dmStatus
      });
      await Server.addCase({
        serverID: interaction.guild.id,
        userID: targetUser.id,
        type: "mute",
        reason: reason,
        expires: Date.now() + msDuration,
      });
    } catch (error) {
      console.error("There was an error when muting:", error);
      await modActionMessage({
        interaction,
        success: false,
        action: "Mute",
        actionLine: "Unknown error occured while executing this command.",
      });
    }
  },

  name: "mute",
  description: "Mute a user!",
  devOnly: false,
  testOnly: false,
  permissionsRequired: [PermissionFlagsBits.MuteMembers],
  botPermissionsRequired: [PermissionFlagsBits.MuteMembers],
  options: [
    {
      name: "target",
      description: "The user to mute.",
      required: true,
      type: ApplicationCommandOptionType.User,
    },
    {
      name: "duration",
      description: "Time for mute (EX: 30m, 2h, 1d)",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
    {
      name: "reason",
      description: "The reason to mute.",
      required: false,
      type: ApplicationCommandOptionType.String,
    },
  ],
};
