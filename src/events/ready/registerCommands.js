import chalk from "chalk";
import areCommandsDifferent from "../../utils/areCommandsDifferent.js";
import config from "../../../config.json" assert { type: "json" };
import getLocalCommands from "../../utils/getLocalCommands.js";
import getApplicationCommands from "../../utils/getApplicationCommands.js";

const { testServer, devs } = config;

export default async (client) => {
  try {
    const localCommands = await getLocalCommands();
    const applicationCommands = await getApplicationCommands(
      client,
      testServer
    );

    for (const localCommand of localCommands) {
      const { name, description, options } = localCommand.default;

      const existingCommand = await applicationCommands.cache.find(
        (command) => command.name === name
      );
      if (existingCommand) {
        if (localCommand.deleted) {
          await applicationCommands.delete(existingCommand.id);
          console.log(chalk.yellow("Deleted command: ") + chalk.cyan(name));
          continue;
        }
        if (areCommandsDifferent(existingCommand, localCommand.default)) {
          await applicationCommands.edit(existingCommand.id, {
            description,
            options,
          });
          console.log(chalk.yellow("Updated command: ") + chalk.cyan(name));
        }
      } else {
        if (localCommand.deleted) {
          console.log(chalk.yellow("Skipping registry: " + chalk.cyan(name)));
          continue;
        }
        await applicationCommands.create({
          name,
          description,
          options,
        });
        console.log(chalk.green("Created command: ") + chalk.cyan(name));
      }
    }
  } catch (error) {
    console.log(chalk.red("ERROR:") + chalk.yellow(` ${error}`));
  }
};
