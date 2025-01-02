import { SlashCommandBuilder } from "discord.js";
import { updateServerSettings } from "../../utils/server_settings.js";
export default {
  data: new SlashCommandBuilder()
    .setName("inactivityduration")
    .setDescription("Provides information about the server.")
    .addIntegerOption((option) =>
      option
        .setName("time")
        .setDescription("Max inactivity period (In Hours)")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(8760)
    ),
  async execute(interaction) {
    const newTime = interaction.options.getInteger("time");
    const serverId = interaction.guild.id;

    updateServerSettings(serverId, { inactivityduration: newTime });
  },
};
