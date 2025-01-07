import { Client, GatewayIntentBits, Collection } from "discord.js";
import "dotenv/config";
import { registerCommands } from "./utils/register_commands.js";

import {
  startInactivityCheck,
  updateUserActivity,
} from "./modules/inactivity.js";
import pkg from "pg";
import { setRPC } from "./utils/rpc.js";
import chalk from "chalk";
import { modulesInit } from "./modules/startModules.js";
// import { manageXPOnMessage } from "./modules/levels.js";
const { Client: DBClient } = pkg;

export const dbclient = new DBClient({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.AutoModerationConfiguration,
    GatewayIntentBits.AutoModerationExecution,
    GatewayIntentBits.GuildMessagePolls,
    GatewayIntentBits.DirectMessagePolls,
  ],
});
client.commands = new Collection();

// START UP
console.log(chalk.bold.blue("== INITIALIZING =="));
console.log(chalk.black("Waiting for login..."));
const initilize = async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  console.log(chalk.black("Connecting to database..."));
  await dbclient
    .connect()
    .then(() => console.log("Connected to database!"))
    .catch((err) => console.error("Connection error", err.stack));
  console.log(chalk.black("Starting modules..."));
  await modulesInit(client);
  console.log(chalk.black("Registering Commands..."));
  await registerCommands(client);
  console.log(chalk.black("Setting up RPC..."));
  await setRPC(client);
  console.log(chalk.bold.blue("== INITIALIZED =="));
  console.log(chalk.green("✔ SaturnWave is Ready"));
  console.log(
    chalk.magentaBright("Support the bot development at ") +
      chalk.underline.cyan("https://github.com/Flamality/SaturnWave")
  );
};

client.on("ready", () => {
  try {
    initilize();
  } catch (error) {
    console.error("Error initilizing");
  }
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
      content: `There was an error while executing this command! \n -# ${error}`,
      ephemeral: true,
    });
  }
});

// client.on("messageCreate", async (message) => {
//   console.log("Message sent");
//   if (message.author.bot) return;

//   // INACTIVITY MODULE
//   const serverId = message.guild.id;
//   const userId = message.author.id;

//   await updateUserActivity(serverId, userId);
// });

client.on("messageCreate", async (message) => {
  try {
    if (message.author.bot) return;

    // INACTIVITY MODULE
    const serverId = message.guild.id;
    const userId = message.author.id;

    await updateUserActivity(serverId, userId);

    // LEVELS MODULE
    // manageXPOnMessage(message);
  } catch (err) {
    console.error("Error in message handler:", err);
  }
});

client.login(process.env.DISCORD_TOKEN);
