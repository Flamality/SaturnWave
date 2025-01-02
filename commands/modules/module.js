import { SlashCommandBuilder } from "discord.js";
import {
  updateServerSettings,
  getServerSettings,
} from "../../utils/server_settings.js";

export default {
  data: new SlashCommandBuilder()
    .setName("module")
    .setDescription("Manage bot modules.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("enable")
        .setDescription("Enable a specific module.")
        .addStringOption((option) =>
          option
            .setName("module")
            .setDescription("The module to enable.")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("disable")
        .setDescription("Disable a specific module.")
        .addStringOption((option) =>
          option
            .setName("module")
            .setDescription("The module to disable.")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("list")
        .setDescription("List all modules and their current status.")
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const serverId = interaction.guild.id;

    if (subcommand === "enable") {
      const moduleName = interaction.options.getString("module");
      const settings = await getServerSettings(serverId);

      // Enable the module by setting it to true
      settings.modules = settings.modules || {};
      settings.modules[moduleName] = true;
      updateServerSettings(serverId, settings);

      await interaction.reply(`${moduleName} module has been enabled.`);
    } else if (subcommand === "disable") {
      const moduleName = interaction.options.getString("module");
      const settings = await getServerSettings(serverId);

      // Disable the module by setting it to false
      settings.modules = settings.modules || {};
      settings.modules[moduleName] = false;
      updateServerSettings(serverId, settings);

      await interaction.reply(`${moduleName} module has been disabled.`);
    } else if (subcommand === "list") {
      const settings = await getServerSettings(serverId);
      const modules = settings.modules || {};

      let statusMessage = "Current module status:\n";
      if (Object.keys(modules).length === 0) {
        statusMessage = "No modules found or no modules enabled.";
      } else {
        for (const [module, status] of Object.entries(modules)) {
          statusMessage += `${module}: ${status ? "Enabled" : "Disabled"}\n`;
        }
      }

      await interaction.reply(statusMessage);
    }
  },
};
