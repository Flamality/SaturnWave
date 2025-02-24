import command from "../../handlers/command.js";
export default async (client, interaction) => {
  if (!interaction.isChatInputCommand()) return;
  command(client, interaction);
  return;
};
