import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import ms from "ms";
import { default as prettyMS } from "pretty-ms";
import {
  commandFollowupSuccess,
  modActionFollowup,
} from "../../utils/userEvents.js";

export default {
  callback: async (client, interaction) => {
    const targetUID = interaction.options.get("target").value;
    const duration = interaction.options.get("duration").value;
    const reason =
      interaction.options.get("reason")?.value || "No reason provided.";

    await interaction.deferReply();

    try {
      const targetUser = await interaction.guild.members.fetch(targetUID);
    } catch (error) {
      await interaction.editReply({
        content: "Cannot find user.",
        ephemeral: true,
      });
      return;
    }
    const targetUser = await interaction.guild.members.fetch(targetUID);
    if (targetUser.user.bot) {
      await interaction.editReply({
        content: "Cannot mute a bot.",
        ephemeral: true,
      });
      return;
    }

    const msDuration = ms(duration);
    if (isNaN(msDuration)) {
      await interaction.editReply({
        content: "Invalid duration format.",
        ephemeral: true,
      });
      return;
    }
    if (msDuration < 5000) {
      await interaction.editReply({
        content: "Duration must be at least 5 seconds.",
        ephemeral: true,
      });
      return;
    }
    if (msDuration > 2.419e9) {
      await interaction.editReply({
        content: "Duration cannot exceed 28 days.",
        ephemeral: true,
      });
      return;
    }
    const botMember = await interaction.guild.members.fetchMe();

    const targetUserRolePosition = targetUser.roles.highest.position;
    const requestUserRolePosition = interaction.member.roles.highest.position;
    const botRolePosition = botMember.roles.highest.position;

    if (targetUserRolePosition >= requestUserRolePosition) {
      await interaction.editReply({
        content: "You cannot mute this user.",
        ephemeral: true,
      });
      return;
    }

    if (targetUserRolePosition >= botRolePosition) {
      await interaction.editReply({
        content: "I cannot mute this user.",
        ephemeral: true,
      });
      return;
    }

    try {
      if (targetUser.isCommunicationDisabled()) {
        await targetUser.timeout(msDuration, reason);
        await modActionFollowup(
          interaction,
          true,
          "mute",
          targetUser,
          reason,
          false,
          prettyMS(msDuration, {
            verbose: true,
          })
        );
        return;
      }
      await targetUser.timeout(msDuration, reason);
      await modActionFollowup(
        interaction,
        true,
        "mute",
        targetUser,
        reason,
        false,
        prettyMS(msDuration, {
          verbose: true,
        })
      );
    } catch (error) {
      console.log("There was an error when mutting", error);
      await interaction.editReply({
        content: "Error occurred while trying to mute user.",
        ephemeral: true,
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
