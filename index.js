import { Client, GatewayIntentBits, Collection } from "discord.js";
import "dotenv/config";
import { registerCommands } from "./utils/register_commands.js";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  registerCommands(client);
});

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

client.login(process.env.DISCORD_TOKEN);
