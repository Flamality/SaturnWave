import { Client, GatewayIntentBits, Collection } from "discord.js";
import "dotenv/config";
import { registerCommands } from "./utils/register_commands.js";
import {
  startInactivityCheck,
  updateUserActivity,
} from "./modules/inactivity.js";
import pkg from "pg";
import { manageXPOnMessage } from "./modules/levels.js";
const { Client: DBClient } = pkg;

export const dbclient = new DBClient({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
});

dbclient
  .connect()
  .then(() => console.log("Connected to database"))
  .catch((err) => console.error("Connection error", err.stack));

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

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  startInactivityCheck(client);
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
