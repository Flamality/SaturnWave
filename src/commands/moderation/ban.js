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
        "ban",
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
        "ban",
        targetUser,
        "You cannot ban the server owner."
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
        "ban",
        targetUser,
        "You cannot ban this user."
      );
      return;
    }

    if (targetUserRolePosition >= botRolePosition) {
      await modActionFollowupFail(
        interaction,
        false,
        "ban",
        targetUser,
        "I cannot ban this user."
      );
      return;
    }

    try {
      await targetUser.ban({ reason });
      await modActionFollowup(
        interaction,
        true,
        "ban",
        targetUser,
        reason,
        false
      );
    } catch (error) {
      console.log("There was an error when banning");
      await modActionFollowupFail(
        interaction,
        false,
        "ban",
        targetUser,
        "Unknown error occured when executing this command."
      );
    }
  },
  name: "ban",
  description: "Ban a user!",
  devOnly: false,
  testOnly: false,
  permissionsRequired: [PermissionFlagsBits.BanMembers],
  botPermissionsRequired: [PermissionFlagsBits.BanMembers],
  options: [
    {
      name: "target",
      description: "The user to ban.",
      required: true,
      type: ApplicationCommandOptionType.User,
    },
    {
      name: "reason",
      description: "The reason to ban.",
      required: false,
      type: ApplicationCommandOptionType.String,
    },
  ],
};
