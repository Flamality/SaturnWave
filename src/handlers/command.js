import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  GuildMember,
  PermissionFlagsBits,
} from "discord.js";
import getLocalCommands from "../utils/getLocalCommands.js";
import config from "../../config.json" assert { type: "json" };
import { modActionMessage } from "../utils/userEvents.js";

const { testServer, devs, prefix } = config;

export default async (client, interaction) => {
  const localCommands = await getLocalCommands();
  let commandData = null;
  let args = [];

  if (interaction.isCommand?.()) {
    const commandObject = localCommands.find(
      (cmd) => cmd.default.name === interaction.commandName
    );
    if (!commandObject) return;
    args = interaction.options._hoistedOptions.map((option) => option.value);
    if (interaction.options._subcommand) {
      args.unshift(interaction.options._subcommand);
    }
    cleanArgs(args, commandObject);

    commandData = {
      name: interaction.commandName,
      author: interaction.user,
      guild: interaction.guild,
      channel: interaction.channel,
      args,
      commandObject,
    };
  } else if (interaction.content?.startsWith(prefix)) {
    args = interaction.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();
    const commandObject = localCommands.find(
      (cmd) =>
        cmd.default.name === commandName ||
        (cmd.default.alias && cmd.default.alias.includes(commandName))
    );

    if (!commandObject) return;

    cleanArgs(args, commandObject);

    commandData = {
      name: commandName,
      author: interaction.author,
      guild: interaction.guild,
      channel: interaction.channel,
      args,
      commandObject,
    };
  }

  if (!commandData || commandData.author?.bot) return;

  if (
    commandData.commandObject.devOnly &&
    !devs.includes(commandData.author.id)
  ) {
    await modActionMessage({
      interaction,
      action: commandData.name,
      actionLine: "You must be a developer to use this command.",
    });
  }

  if (
    commandData.commandObject.testOnly &&
    interaction.guild.id !== testServer
  ) {
    await modActionMessage({
      interaction,
      action: commandData.name,
      actionLine: "This command if only for testing environments.",
    });
    return;
  }

  if (commandData.commandObject.default.botPermissionsRequired?.length) {
    const bot = await interaction.guild.members.me;
    for (const perm of commandData.commandObject.default
      .botPermissionsRequired) {
      const permissionName = Object.keys(PermissionFlagsBits).find(
        (key) => PermissionFlagsBits[key] === perm
      );
      if (!bot.permissions.has(perm)) {
        await modActionMessage({
          interaction,
          action: commandData.name,
          actionLine: `I need the **${permissionName}** permission to do that.`,
        });
        return;
      }
    }
  }
  if (commandData.commandObject.default.permissionsRequired?.length) {
    for (const perm of commandData.commandObject.default.permissionsRequired) {
      let authorMember = commandData.author;

      if (!(authorMember instanceof GuildMember)) {
        try {
          authorMember = await interaction.guild.members.fetch(
            commandData.author.id
          );
        } catch (error) {
          console.error("Failed to fetch GuildMember:", error);
          return;
        }
      }
      const permissionName = Object.keys(PermissionFlagsBits).find(
        (key) => PermissionFlagsBits[key] === perm
      );
      if (!authorMember.permissions.has(perm)) {
        await modActionMessage({
          interaction,
          action: commandData.name,
          actionLine: `You need the **${permissionName}** permission to use this command.`,
        });
        return;
      }
    }
  }

  try {
    await commandData.commandObject.default.callback(
      client,
      interaction,
      commandData
    );
  } catch (error) {
    console.log(error);
  }
};

const cleanArgs = (args, commandObject) => {
  args.forEach((arg, i) => {
    const optionObject = commandObject?.default?.options[i];
    if (!optionObject) return;

    if (optionObject.type === ApplicationCommandOptionType.User) {
      args[i] = cleanId(arg);
    }

    if (
      optionObject.type === ApplicationCommandOptionType.String &&
      i === args.length - 1
    ) {
      args[i] = args.slice(i).join(" ");
    }
  });
};

const cleanId = (arg) =>
  typeof arg === "string" ? arg.replace(/[<@!>]/g, "") : arg;
