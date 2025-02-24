import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import {
  modActionFollowup,
  modActionFollowupFail,
} from "../../utils/userEvents.js";

export default {
  callback: async (client, interaction) => {
    const targetUID = interaction.options.get("target").value;
    const reason =
      interaction.options.get("reason")?.value || "No reason provided.";

    await interaction.deferReply();

    try {
      const targetUser = await interaction.guild.members.fetch(targetUID);
    } catch (error) {
      await modActionFollowupFail(
        interaction,
        false,
        "kick",
        "user",
        "Cannot find user."
      );
      return;
    }
    const targetUser = await interaction.guild.members.fetch(targetUID);

    if (targetUser.id === interaction.guild.ownerId) {
      await modActionFollowupFail(
        interaction,
        false,
        "kick",
        targetUser,
        "You cannot kick the server owner."
      );
      return;
    }
    const botMember = await interaction.guild.members.fetchMe();

    const targetUserRolePosition = targetUser.roles.highest.position;
    const requestUserRolePosition = interaction.member.roles.highest.position;
    const botRolePosition = botMember.roles.highest.position;

    if (targetUserRolePosition >= requestUserRolePosition) {
      await modActionFollowupFail(
        interaction,
        false,
        "kick",
        targetUser,
        "You cannot kick this user."
      );
      return;
    }

    if (targetUserRolePosition >= botRolePosition) {
      await modActionFollowupFail(
        interaction,
        false,
        "kick",
        targetUser,
        "I cannot kick this user."
      );
      return;
    }

    try {
      await targetUser.kick(reason);
      await modActionFollowup(
        interaction,
        true,
        "kick",
        targetUser,
        reason,
        false
      );
    } catch (error) {
      console.log("There was an error when kicking");
      await modActionFollowupFail(
        interaction,
        false,
        "kick",
        targetUser,
        "Unknown error occured when executing this command."
      );
    }
  },
  name: "kick",
  description: "Kick a user!",
  devOnly: false,
  testOnly: false,
  permissionsRequired: [PermissionFlagsBits.KickMembers],
  botPermissionsRequired: [PermissionFlagsBits.KickMembers],
  options: [
    {
      name: "target",
      description: "The user to kick.",
      required: true,
      type: ApplicationCommandOptionType.User,
    },
    {
      name: "reason",
      description: "The reason to kick.",
      required: false,
      type: ApplicationCommandOptionType.String,
    },
  ],
};
