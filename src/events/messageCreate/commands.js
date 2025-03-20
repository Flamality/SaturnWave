import command from "../../handlers/command.js";
import { Server } from "../../models/Settings.js";

export default async (client, message) => {
  const prefix = await Server.getSetting(message.guild.id, "general.prefix");
  if (message.author.bot || !message.content.startsWith(prefix)) return;
  command(client, message);
  return;
};
