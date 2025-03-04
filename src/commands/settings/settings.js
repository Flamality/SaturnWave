import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import { Server } from "../../models/Settings.js";
export default {
  callback: async (client, interaction, commandData) => {
    const sub = commandData.args[0];

    if (sub == "update") {
      let oldValue;
      try {
        oldValue = Server.getSetting({
          serverID: commandData.guild.id,
          key: commandData.args[1],
        });
      } catch (error) {}
    } else if (sub == "view") {
      let value;
      try {
        value = await Server.getSetting({
          serverID: commandData.guild.id,
          key: commandData.args[1],
        });
        interaction.reply({
          content: `Current value for ${commandData.args[1]}: \`${value}\``,
        });
      } catch (error) {}
    }
  },
  name: "settings",
  description: "Change a setting.",
  devOnly: false,
  testOnly: false,
  alias: ["s"],
  permissionsRequired: [PermissionFlagsBits.Administrator],
  botPermissionsRequired: [PermissionFlagsBits.ManageGuild],
  options: [
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: "view",
      description: "View the current value of a setting.",
      options: [
        {
          name: "key",
          description: "The settings key.",
          required: true,
          type: ApplicationCommandOptionType.String,
        },
      ],
    },
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: "update",
      description: "Update a setting.",
      options: [
        {
          name: "key",
          description: "The settings key.",
          required: true,
          type: ApplicationCommandOptionType.String,
        },
        {
          name: "value",
          description: "The new value of the setting.",
          required: true,
          type: ApplicationCommandOptionType.String,
        },
      ],
    },
  ],
};
