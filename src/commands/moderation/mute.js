import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import ms from "ms";
import { default as prettyMS } from "pretty-ms";
import {
  commandFollowupSuccess,
  modActionFollowup,
  modActionFollowupFail,
} from "../../utils/userEvents.js";
import { Server } from "../../models/Settings.js";

export default {
  callback: async (client, interaction, commandData) => {
    console.log(commandData.args);
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
      await modActionFollowupFail(
        interaction,
        false,
        "mute",
        "user",
        "Cannot find user."
      );
      return;
    }

    // 🤖 Prevent muting bots
    if (targetUser.user.bot) {
      await modActionFollowupFail(
        interaction,
        false,
        "mute",
        targetUser,
        "Cannot mute a bot."
      );
      return;
    }

    // ⏲️ Duration checks
    const msDuration = ms(duration);
    if (isNaN(msDuration)) {
      await modActionFollowupFail(
        interaction,
        false,
        "mute",
        targetUser,
        "Invalid duration format."
      );
      return;
    }

    if (msDuration < 5000) {
      await modActionFollowupFail(
        interaction,
        false,
        "mute",
        targetUser,
        "Duration cannot be less than 5 seconds."
      );
      return;
    }

    if (msDuration > 2.419e9) {
      await modActionFollowupFail(
        interaction,
        false,
        "mute",
        targetUser,
        "Duration cannot exceed 28 days."
      );
      return;
    }

    // 🔑 Role hierarchy checks
    const botMember = await interaction.guild.members.fetchMe();
    const targetUserRolePosition = targetUser.roles.highest.position;
    const requestUserRolePosition = interaction.member.roles.highest.position;
    const botRolePosition = botMember.roles.highest.position;

    if (targetUserRolePosition >= requestUserRolePosition) {
      await modActionFollowupFail(
        interaction,
        false,
        "mute",
        targetUser,
        "You cannot mute this user."
      );
      return;
    }

    if (targetUserRolePosition >= botRolePosition) {
      await modActionFollowupFail(
        interaction,
        false,
        "mute",
        targetUser,
        "I cannot mute this user."
      );
      return;
    }

    // 🔇 Apply mute
    try {
      await targetUser.timeout(msDuration, reason);
      await modActionFollowup(
        interaction,
        true,
        "mute",
        targetUser,
        reason,
        false,
        prettyMS(msDuration, { verbose: true })
      );
      await Server.addCase({
        serverID: interaction.guild.id,
        userID: targetUser.id,
        type: "mute",
        reason: reason,
        expires: Date.now() + msDuration,
      });
    } catch (error) {
      console.error("There was an error when muting:", error);
      await modActionFollowupFail(
        interaction,
        false,
        "mute",
        targetUser,
        "Unknown error occurred when executing this command."
      );
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
