import express from "express";
import { client } from "./index.js"; // Import the bot client
import cors from "cors";

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Root API route
app.get("/", (req, res) => {
  res.send("Bot API is running!");
});

// Example API to get bot status
app.get("/api/status", (req, res) => {
  if (!client || !client.user) {
    return res.status(500).json({ error: "Bot is not ready" });
  }

  res.json({
    username: client.user.username,
    servers: client.guilds.cache.size,
    users: client.users.cache.size,
  });
});

// Example: Send a message to a specific channel
app.post("/api/sendMessage", async (req, res) => {
  const { channelId, message } = req.body;
  if (!channelId || !message) {
    return res.status(400).json({ error: "Missing channelId or message" });
  }

  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel) return res.status(404).json({ error: "Channel not found" });

    await channel.send(message);
    res.json({ success: true, message: "Message sent!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Start Express server
export const startAPI = () => {
  app.listen(port, () => {
    console.log(`API is running on port ${port}`);
  });
};
