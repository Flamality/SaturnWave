export const setRPC = (client) => {
  client.user.setPresence({
    activities: [{ name: "github.com/Flamality/SaturnWave" }],
  });
  console.log("Set RPC!");
};
