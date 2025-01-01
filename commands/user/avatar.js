import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Get the avatar of a user.")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("The user whose avatar to display")
        .setRequired(false)
    ),

  async execute(interaction) {
    const targetUser =
      interaction.options.getUser("target") || interaction.user; // Default to the command author if no target user
    const avatarURL = targetUser.displayAvatarURL({
      dynamic: true,
      size: 1024,
    }); // Get the avatar URL (dynamic and 1024px size)

    return interaction.reply({
      content: `${targetUser.tag}'s avatar:`,
      files: [avatarURL],
    });
  },
};
