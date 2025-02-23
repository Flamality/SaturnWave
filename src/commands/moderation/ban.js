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
        content: "You cannot ban the server owner.",
      });
      return;
    }
    const botMember = await interaction.guild.members.fetchMe();

    const targetUserRolePosition = targetUser.roles.highest.position;
    const requestUserRolePosition = interaction.member.roles.highest.position;
    const botRolePosition = botMember.roles.highest.position;

    if (targetUserRolePosition >= requestUserRolePosition) {
      await interaction.editReply({
        content: "You cannot ban this user.",
      });
      return;
    }

    if (targetUserRolePosition >= botRolePosition) {
      await interaction.editReply({
        content: "I cannot ban this user.",
      });
      return;
    }

    try {
      await targetUser.ban({ reason });
      await interaction.editReply({
        content: `User ${targetUser.user.username} was banned\nReason: ${reason}.`,
      });
    } catch (error) {
      console.log("There was an error when banning");
      await interaction.editReply({
        content: "Error occurred while trying to ban user.",
        ephemeral: true,
      });
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
