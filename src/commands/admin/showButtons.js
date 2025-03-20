import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} from "discord.js";

export default {
  callback: async (client, interaction, commandData) => {
    const row = new ActionRowBuilder();
    row.components.push(
      new ButtonBuilder()
        .setLabel("Testing")
        .setStyle(ButtonStyle.Primary)
        .setCustomId("testing_button")
    );
    row.components.push(
      new ButtonBuilder()
        .setLabel("AH")
        .setStyle(ButtonStyle.Danger)
        .setCustomId("testing_button2")
    );
    await interaction.reply({ content: "Buttons :D", components: [row] });
  },
  name: "show-buttons",
  description: "Show testing buttons.",
  devOnly: false,
  testOnly: true,
  alias: ["s-b"],
  permissionsRequired: [PermissionFlagsBits.Administrator],
  botPermissionsRequired: [PermissionFlagsBits.ManageGuild],
};
