import { ActivityType } from "discord.js";
export default (client) => {
  client.user.setActivity({
    name: "github.com/Flamality/SaturnWave",
    type: ActivityType.Watching,
  });
};
