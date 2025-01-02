import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { REST, Routes } from "discord.js";

export function getCommandFiles(dir) {
  let files = [];
  const items = fs.readdirSync(dir);

  items.forEach((item) => {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      files = files.concat(getCommandFiles(fullPath));
    } else if (item.endsWith(".js")) {
      files.push(fullPath);
    }
  });

  return files;
}

export async function registerCommands(client) {
  const __dirname = path.resolve();
  const commandsDir = path.join(__dirname, "commands");
  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

  const commandFiles = getCommandFiles(commandsDir);
  const commands = [];

  for (const file of commandFiles) {
    const fileURL = pathToFileURL(file);
    const command = await import(fileURL);
    console.log(command);
    commands.push(command.default.data);

    client.commands.set(command.default.data.name, command.default);
  }

  try {
    console.log("Registering commands...", commands);
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    });
    console.log("Guild commands registered!");
  } catch (error) {
    console.error("Error registering commands:", error);
  }
}
