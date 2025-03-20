import {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import defaultSettings from "../../../default.json" assert { type: "json" };
import { Server } from "../../models/Settings.js";

export default {
  callback: async (client, interaction, commandData) => {
    const category = commandData.args[0];

    const serversettings = await Server.getSettings(commandData.guild.id);
    if (category) {
      if (defaultSettings[category]) {
        const embed = new EmbedBuilder()
          .setTitle(`Settings | ${category}`)
          .setDescription(
            `Here are the current settings for the ${category}. Use the bottoms below to configure your servers settings.`
          )
          .setColor("Blue");

        const row = new ActionRowBuilder();

        Object.keys(defaultSettings[category]).forEach((settingKey) => {
          const setting =
            serversettings[category][settingKey] ||
            defaultSettings[category][settingKey];

          embed.addFields({
            name: settingKey,
            value: `\`${
              serversettings[category][settingKey]?.value || setting.value
            }\``,
            inline: false,
          });

          const button = new ButtonBuilder()
            .setCustomId(`setting_${category}_${settingKey}`)
            .setLabel(setting?.name || settingKey)
            .setStyle(ButtonStyle.Primary);

          row.addComponents(button);
        });

        await interaction.reply({ embeds: [embed], components: [row] });
      } else {
        await interaction.reply({
          content: "❌ Invalid category!",
          ephemeral: true,
        });
      }
      /*
       *
       *
       *
       */
    } else {
      /*
       *
       *
       *
       */
      const embed = new EmbedBuilder()
        .setTitle("Server Settings")
        .setColor("Green");

      Object.keys(defaultSettings).forEach((cat) => {
        const settings = Object.keys(defaultSettings[cat])
          ?.map((s) => {
            const setting =
              serversettings[cat][s]?.value ?? defaultSettings[cat][s]?.value;
            const type =
              serversettings[cat][s]?.type ?? defaultSettings[cat][s]?.type;

            let formattedValue;

            if (type === "roles") {
              formattedValue = setting?.length
                ? setting.map((r) => `<@&${r}>`).join(", ")
                : "No roles selected";
            } else if (type === "role") {
              formattedValue = setting ? `<@&${setting}>` : "No role selected";
            } else if (type === "channels") {
              formattedValue = setting?.length
                ? setting.map((c) => `<#${c}>`).join(", ")
                : "No channels selected";
            } else if (type === "channel") {
              formattedValue = setting
                ? `<#${setting}>`
                : "No channel selected";
            } else {
              formattedValue = `\`${setting ?? "Not set"}\``;
            }

            return `**${s}**: ${formattedValue}`;
          })
          .join("\n");

        embed.addFields({
          name: cat,
          value:
            `Available settings:\n${settings}` ||
            "Available settings:\nNo settings",
          inline: false,
        });
      });

      await interaction.reply({ embeds: [embed] });
    }
  },
  name: "settings",
  description: "Change server settings.",
  permissionsRequired: [PermissionFlagsBits.Administrator],
  alias: ["s"],
  botPermissionsRequired: [PermissionFlagsBits.ManageGuild],
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "category",
      description: "The category you want to change settings in.",
    },
  ],
};
