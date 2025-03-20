import defaultSettings from "../../../default.json" assert { type: "json" };
import { Server } from "../../models/Settings.js";
export default async (client, interaction) => {
  if (!interaction.isButton()) return;

  const [type, category, key] = interaction.customId.split("_");
  if (!(type == "confirm")) return;
  if (!defaultSettings[category] || !defaultSettings[category][key]) {
    return interaction.reply({
      content: "❌ Invalid setting!",
      ephemeral: true,
    });
  }
  let settings = await Server.getSettings(interaction.guild.id);
  let setting = settings[category][key];
  if (setting.type === "roles") {
    const selectedRoleIds = interaction.message.values;
    console.log(selectedRoleIds);
    const roles = selectedRoleIds?.map((id) =>
      interaction.guild.roles.cache.get(id)
    );
    if (!roles) {
      return interaction.reply({
        content: "Invalid role selection!",
        ephemeral: true,
      });
    }
    await Server.updateSetting(
      interaction.guild.id,
      `${category}.${key}`,
      roles
    );
    return await interaction.reply({
      content: `Roles updated successfully!`,
    });
  }
};
