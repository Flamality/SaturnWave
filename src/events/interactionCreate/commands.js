import chalk from "chalk";
import config from "../../../config.json" assert { type: "json" };
import getLocalCommands from "../../utils/getLocalCommands.js";
const { testServer, devs } = config;
export default async (client, interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const localCommands = await getLocalCommands();

  try {
    const commandObject = localCommands.find(
      (cmd) => cmd.default.name === interaction.commandName
    );
    if (!commandObject) return;

    if (commandObject.devOnly) {
      if (!devs.includes(interaction.user.id)) {
        interaction.reply({
          content: "This command is only for developers.",
          ephemeral: true,
        });
        return;
      }
    }
    if (commandObject.testOnly) {
      if (!(interaction.guild.id === testServer)) {
        interaction.reply({
          content: "This command is only for testing.",
          ephemeral: true,
        });
        return;
      }
    }

    if (commandObject.botPermissionsRequired?.length) {
      for (const permission of commandObject.botPermissionsRequired) {
        const bot = interaction.guild.members.me;
        if (!bot.permissions.has(permission)) {
          interaction.reply({
            content: `I don't have the required permission: ${permission}.`,
            ephemeral: true,
          });
          return;
        }
      }
    }

    if (commandObject.permissionsRequired?.length) {
      for (const permission of commandObject.permissionsrequired) {
        if (!interaction.member.permissions.has(permission)) {
          interaction.reply({
            content: `You don't have the required permission: ${permission}.`,
            ephemeral: true,
          });
          return;
        }
      }
    }
    await commandObject.default.callback(client, interaction);
  } catch (error) {
    console.log(chalk.red("ERROR RUNNING COMMAND: ") + chalk.yellow(error));
    interaction.editReply({
      content: `An internal error occurred while executing the command.\n${error}`,
    });
  }
};
