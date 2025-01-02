import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import {
  updateServerSettings,
  getServerSettings,
} from "../../utils/server_settings.js";

const allowedModules = ["inactivity", "levels"];

export default {
  data: new SlashCommandBuilder()
    .setName("module")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
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
              { name: "Inactivity", value: "inactivity" },
              { name: "Levels", value: "levels" }
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
              { name: "Inactivity", value: "inactivity" },
              { name: "Levels", value: "levels" }
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

      if (!allowedModules.includes(moduleName)) {
        return interaction.reply(`The module "${moduleName}" is not allowed.`);
      }

      const settings = await getServerSettings(serverId);

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

      // Check if there are no modules in the settings
      if (Object.keys(modules).length === 0) {
        statusMessage = "No modules found or no modules enabled.";
      } else {
        // Loop through allowed modules and check their status
        allowedModules.forEach((module) => {
          const isEnabled = modules.hasOwnProperty(module)
            ? modules[module]
            : false;
          statusMessage += `${module}: ${
            isEnabled ? "🟢 Enabled" : "🔴 Disabled"
          }\n`;
        });
      }

      const embed = {
        color: 0x0099ff,
        title: "Module Status",
        description: "Here are the current status of the modules:",
        fields: [],
        footer: {
          text: "Use `/help` to learn more about each module.",
        },
        timestamp: new Date(),
      };

      // Loop through allowed modules and build embed fields
      allowedModules.forEach((module) => {
        const status = modules.hasOwnProperty(module) ? modules[module] : false;
        const statusColor = status ? "🟢" : "🔴";

        embed.fields.push({
          name: `**${module}**`,
          value: `${statusColor} ${status ? "Enabled" : "Disabled"}`,
          inline: true,
        });
      });

      // Add a final status message if no modules found
      if (Object.keys(modules).length === 0) {
        embed.fields.push({
          name: "No modules enabled",
          value: "🔴 All modules are currently disabled.",
          inline: false,
        });
      }

      await interaction.reply({ embeds: [embed] });
    }
  },
};
