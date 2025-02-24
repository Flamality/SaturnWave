import config from "../../../config.json" assert { type: "json" };
import command from "../../handlers/command.js";

const { testServer, devs, prefix } = config;

export default async (client, message) => {
  if (message.author.bot || !message.content.startsWith(prefix)) return;
  command(client, message);
  return;
};
