import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import {
  updateServerSettings,
  getServerSettings,
} from "../../../utils/server_settings.js";

export default {
  data: new SlashCommandBuilder()
    .setName("inactivity")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDescription("Manage inactivity ring.")

    .addSubcommand((subcommand) =>
      subcommand
        .setName("setperiod")
        .setDescription("Set time before inactivity kick.")
        .addIntegerOption((option) =>
          option
            .setName("time")
            .setDescription("Time before inactivity kick (In Hours).")
            .setRequired(true)
        )
    )

    .addSubcommand((subcommand) =>
      subcommand.setName("settings").setDescription("List current settings.")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("blacklist")
        .setDescription(
          "Add a role to blacklist from being kicked for inactivity."
        )
        .addRoleOption((option) =>
          option
            .setName("role")
            .setDescription("Role to blacklist.")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("whitelist")
        .setDescription("Remove a role from blacklist.")
        .addRoleOption((option) =>
          option
            .setName("role")
            .setDescription("Role to whitelist.")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("viewblacklist")
        .setDescription("view all blacklisted roles.")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("warningmessage")
        .setDescription("Toggle warning message")
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const serverId = interaction.guild.id;
    const settings = await getServerSettings(serverId);
    if (!settings.modules.inactivity)
      return interaction.reply("Module disabled.");
    if (subcommand === "setperiod") {
      const time = interaction.options.getInteger("time");

      if (time <= 0) {
        return interaction.reply("Please provide a valid positive time value.");
      }

      await updateServerSettings(serverId, { inactivityPeriod: time });

      return interaction.reply(`Inactivity period set to ${time} hours.`);
    } else if (subcommand === "settings") {
      const inactivityPeriod = settings.inactivityPeriod || "Not set";

      const response = `**Inactivity Settings:**
- Period: ${inactivityPeriod} hours`;

      return interaction.reply(response);
    } else if (subcommand === "blacklist") {
      const role = interaction.options.getRole("role");

      const blacklist = settings.inactivityBlacklist || [];
      if (blacklist.includes(role.id)) {
        return interaction.reply(`${role.name} is already in the blacklist.`);
      }

      blacklist.push(role.id);
      await updateServerSettings(serverId, {
        inactivityBlacklist: blacklist,
      });

      return interaction.reply(
        `${role.name} has been added to the inactivity blacklist.`
      );
    } else if (subcommand === "whitelist") {
      const role = interaction.options.getRole("role");

      const blacklist = settings.inactivityBlacklist || [];
      if (!blacklist.includes(role.id)) {
        return interaction.reply(`${role.name} is not in the blacklist.`);
      }

      const updatedBlacklist = blacklist.filter((id) => id !== role.id);
      await updateServerSettings(serverId, {
        inactivityBlacklist: updatedBlacklist,
      });

      return interaction.reply(
        `${role.name} has been removed from the inactivity blacklist.`
      );
    } else if (subcommand === "viewblacklist") {
      const blacklist = settings.inactivityBlacklist || [];
      const roleMentions = blacklist.map((id) => `<@&${id}>`).join("\n");

      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle("Blacklisted Roles")
        .setDescription(roleMentions);

      return interaction.reply({ embeds: [embed] });
    }
  },
};
