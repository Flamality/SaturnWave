import { SlashCommandBuilder } from "discord.js";
import {
  updateServerSettings,
  getServerSettings,
} from "../../utils/server_settings.js";

// List of allowed modules
const allowedModules = ["module1", "module2", "module3"]; // Add your module names here

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
            .setDescription(
              "Specify the module to enable. Only allowed modules are listed."
            )
            .setRequired(true)
            .addChoices(
              { name: "Module 1", value: "module1" },
              { name: "Module 2", value: "module2" },
              { name: "Module 3", value: "module3" }
            )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("disable")
        .setDescription("Disable a specific module.")
        .addStringOption((option) =>
          option
            .setName("module")
            .setDescription(
              "Specify the module to disable. Only allowed modules are listed."
            )
            .setRequired(true)
            .addChoices(
              { name: "Module 1", value: "module1" },
              { name: "Module 2", value: "module2" },
              { name: "Module 3", value: "module3" }
            )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("list")
        .setDescription(
          "List all modules and their current status, showing whether they're enabled or disabled."
        )
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const serverId = interaction.guild.id;

    if (subcommand === "enable" || subcommand === "disable") {
      const moduleName = interaction.options.getString("module");

      // Check if the module is in the allowed modules list
      if (!allowedModules.includes(moduleName)) {
        return interaction.reply(`The module "${moduleName}" is not allowed.`);
      }

      const settings = await getServerSettings(serverId);

      // Enable or disable the module based on the subcommand
      settings.modules = settings.modules || {};
      settings.modules[moduleName] = subcommand === "enable" ? true : false;
      updateServerSettings(serverId, settings);

      await interaction.reply(
        `${moduleName} module has been ${
          subcommand === "enable" ? "enabled" : "disabled"
        }.`
      );
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
