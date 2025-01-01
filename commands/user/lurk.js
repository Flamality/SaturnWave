import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("lurk")
    .setDescription("Mark yourself as lurking in the channel."),

  async execute(interaction) {
    return interaction.reply(
      `${interaction.user.tag} is lurking in the shadows... 👀`
    );
  },
};
