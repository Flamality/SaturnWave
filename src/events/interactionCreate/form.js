import { Server } from "../../models/Settings.js";

export default async (client, interaction) => {
  if (!interaction.isModalSubmit()) return;

  const [_, category, key] = interaction.customId.split("_");
  const newValue = interaction.fields.getTextInputValue("new_value");

  await Server.updateSetting(
    interaction.guild.id,
    `${category}.${key}`,
    newValue
  );
  await interaction.reply({
    content: `✅ **${key}** updated to \`${newValue}\``,
    ephemeral: true,
  });
};
