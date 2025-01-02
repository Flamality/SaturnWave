import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { REST, Routes } from "discord.js";

// Function to recursively fetch command files
export function getCommandFiles(dir) {
  let files = [];
  const items = fs.readdirSync(dir);

  items.forEach((item) => {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      files = files.concat(getCommandFiles(fullPath)); // Recurse into subdirectories
    } else if (item.endsWith(".js")) {
      files.push(fullPath); // Add .js files
    }
  });

  return files;
}

// Function to register commands
export async function registerCommands(client) {
  const __dirname = path.resolve();
  const commandsDir = path.join(__dirname, "commands");
  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

  const commandFiles = getCommandFiles(commandsDir); // Get all command files recursively
  const commands = [];

  for (const file of commandFiles) {
    const fileURL = pathToFileURL(file); // Convert file path to file URL
    const command = await import(fileURL); // Import the command file dynamically
    commands.push(command.default.data.toJSON());

    // Add the command to the client.commands collection
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
