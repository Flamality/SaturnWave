import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { updateServerSettings } from "../../utils/server_settings.js";

export default {
  data: new SlashCommandBuilder()
    .setName("setprefix")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDescription("Set a custom prefix for this server")
    .addStringOption((option) =>
      option
        .setName("prefix")
        .setDescription("The new prefix")
        .setRequired(true)
    ),

  async execute(interaction) {
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      return interaction.reply({
        content: "You don't have permission to use this command.",
        ephemeral: true,
      });
    }

    const newPrefix = interaction.options.getString("prefix");
    const serverId = interaction.guild.id;

    updateServerSettings(serverId, { prefix: newPrefix });

    await interaction.reply(`Server prefix updated to: \`${newPrefix}\``);
  },
};
