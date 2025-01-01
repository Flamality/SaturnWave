import {
  Client,
  GatewayIntentBits,
  Collection,
  REST,
  Routes,
} from "discord.js";
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  // Register commands when the bot is ready
  registerCommands();
});

// Register commands
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

function getCommandFiles(dir) {
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

async function registerCommands() {
  const __dirname = path.resolve();
  const commandsDir = path.join(__dirname, "commands");

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

// WHEN COMMAND EXECUTED
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

// Correct way to instantiate the REST client and set the token

client.login(process.env.DISCORD_TOKEN);
