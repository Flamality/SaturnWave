import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Get the invite link for this bot."),

  async execute(interaction) {
    const botInviteLink =
      "https://discord.com/oauth2/authorize?client_id=1307918297748078693&permissions=8&integration_type=0&scope=bot";
    return interaction.reply(
      `Here is the invite link for the bot: [Invite Me](<${botInviteLink}>)`
    );
  },
};
