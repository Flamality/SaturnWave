import { Server } from "../../models/Settings.js";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  RoleSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import defaultSettings from "../../../default.json" assert { type: "json" };

export default async (client, interaction) => {
  if (!interaction.isButton()) return;

  const [type, category, key] = interaction.customId.split("_");
  if (!(type == "setting")) return;
  if (!defaultSettings[category] || !defaultSettings[category][key]) {
    return interaction.reply({
      content: "❌ Invalid setting!",
      ephemeral: true,
    });
  }
  let settings = await Server.getSettings(interaction.guild.id);
  let setting = settings[category][key];

  if (setting?.type === "boolean") {
    const newValue = !setting.value;
    await Server.updateSetting(
      interaction.guild.id,
      `${category}.${key}`,
      newValue
    );
    return interaction.reply({
      content: `✅ **${key}** updated to \`${newValue}\``,
      ephemeral: true,
    });
  }
  if (setting?.type === "string") {
    const modal = new ModalBuilder()
      .setCustomId(`edit_${category}_${key}`)
      .setTitle(`Edit ${key}`);

    const input = new TextInputBuilder()
      .setCustomId("new_value")
      .setLabel(`New value for ${key}:`)
      .setStyle(TextInputStyle.Short)
      .setPlaceholder(`Current: ${setting.value}`)
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(input));
    return await interaction.showModal(modal);
  }
  if (setting?.type === "number") {
    const modal = new ModalBuilder()
      .setCustomId(`edit_${category}_${key}`)
      .setTitle(`Edit ${key}`);

    const input = new TextInputBuilder()
      .setCustomId("new_value")
      .setLabel(`New value for ${key}:`)
      .setStyle(TextInputStyle.Short)
      .setPlaceholder(`Current: ${setting.value}`)
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(input));
    return await interaction.showModal(modal);
  }
  if (setting?.type === "roles") {
    const roles = await interaction.guild.roles.fetch();
    const select = new RoleSelectMenuBuilder()
      .setCustomId(`roleedit_${category}_${key}`)
      .setMinValues(0)
      .setMaxValues(12)
      .setPlaceholder(
        `Current: ${setting.value.map((r) => `<@&${r}>`).join(", ")}`
      );
    const row = new ActionRowBuilder().addComponents(select);
    return await interaction.reply({
      content: "Please select a role.",
      components: [row],
      ephemeral: true,
    });
  }
};
