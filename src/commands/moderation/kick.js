import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import {
  modActionDM,
  modActionFollowup,
  modActionFollowupFail,
  modActionMessage,
} from "../../utils/userEvents.js";

export default {
  callback: async (client, interaction, commandData) => {
        const isCommand = interaction.isCommand?.();
        let targetUID = commandData.args[0];
    
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
    
        // 🔑 Role hierarchy checks
        const botMember = await interaction.guild.members.fetchMe();
        const targetUserRolePosition = targetUser.roles.highest.position;
        const requestUserRolePosition = interaction.member.roles.highest.position;
        const botRolePosition = botMember.roles.highest.position;
    
        if (targetUserRolePosition >= requestUserRolePosition) {
          await modActionMessage({
            interaction,
            success: false,
            action: "Kick",
            actionLine: "You cannot kick this user.",
          });
          return;
        }
    
        if (targetUserRolePosition >= botRolePosition) {
          await modActionMessage({
            interaction,
            success: false,
            action: "Kick",
            actionLine: "I cannot kick this user.",
          });
          return;
        }
    
        // 🔇 Apply mute
        try {
          const dmStatus = await modActionDM({
                  client,
                  interaction,
                  userID: targetUser.id,
                  action: "Kick",
                  actionLine: "kicked",
                  reason: reason,
                });
          await targetUser.kick(reason);
          await modActionMessage({
            interaction,
            success: true,
            action: "Kick",
            actionLine: `Kicked ${targetUser}`,
            reason,
            dmStatus
          });
          await Server.addCase({
            serverID: interaction.guild.id,
            userID: targetUser.id,
            type: "kick",
            reason: reason,
          });
        } catch (error) {
          console.error("There was an error when muting:", error);
          await modActionMessage({
            interaction,
            success: false,
            action: "Kick",
            actionLine: "Unknown error occured while executing this command.",
          });
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
