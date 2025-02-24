export default {
  name: "ping",
  description: "Pong!",
  devOnly: false,
  testOnly: false,
  options: [],
  callback: async (client, interaction, commandData) => {
    const sentMessage = await interaction.reply("Pong!");
    const ping = sentMessage.createdTimestamp - interaction.createdTimestamp;

    sentMessage.edit(
      `Pong! Client: ${ping}ms | WebSocket: ${client.ws.ping}ms`
    );
  },
};
