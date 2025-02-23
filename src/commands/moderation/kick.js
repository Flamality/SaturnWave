import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";

export default {
  callback: async (client, interaction) => {
    const targetUID = interaction.options.get("target").value;
    const reason =
      interaction.options.get("reason")?.value || "No reason provided.";

    await interaction.deferReply();

    try {
      const targetUser = await interaction.guild.members.fetch(targetUID);
    } catch (error) {
      await interaction.editReply({
        content: "Cannot find user.",
      });
      return;
    }
    const targetUser = await interaction.guild.members.fetch(targetUID);

    if (targetUser.id === interaction.guild.ownerId) {
      await interaction.editReply({
        content: "You cannot kick the server owner.",
      });
      return;
    }
    const botMember = await interaction.guild.members.fetchMe();

    const targetUserRolePosition = targetUser.roles.highest.position;
    const requestUserRolePosition = interaction.member.roles.highest.position;
    const botRolePosition = botMember.roles.highest.position;

    if (targetUserRolePosition >= requestUserRolePosition) {
      await interaction.editReply({
        content: "You cannot kick this user.",
      });
      return;
    }

    if (targetUserRolePosition >= botRolePosition) {
      await interaction.editReply({
        content: "I cannot kick this user.",
      });
      return;
    }

    try {
      await targetUser.kick(reason);
      await interaction.editReply({
        content: `User ${targetUser.user.username} was kicked\nReason: ${reason}.`,
      });
    } catch (error) {
      console.log("There was an error when kicking");
      await interaction.editReply({
        content: "Error occurred while trying to ban user.",
        ephemeral: true,
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
