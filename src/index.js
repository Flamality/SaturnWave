import chalk from "chalk";
import { Client, GatewayIntentBits, ActivityType } from "discord.js";
import "dotenv/config";
import event from "./handlers/event.js";

import pkg from "pg";
import { startAPI } from "./api.js";
const { Client: DBClient } = pkg;
export const dbclient = new DBClient({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
});
export const client = new Client({
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
(async () => {
  await dbclient
    .connect()
    .then(() => console.log("Connected to database!"))
    .catch((err) => console.error("Connection error", err.stack));
  event(client);
  client.login(process.env.DISCORD_TOKEN);
  startAPI();
})();
