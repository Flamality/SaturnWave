import express from "express";
import { client } from "./index.js";
import cors from "cors";
import { Server } from "./models/Settings.js";

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Bot API is running!");
});

app.get("/status", (req, res) => {
  if (!client || !client.user) {
    return res.status(500).json({ error: "Bot is not ready" });
  }

  res.json({
    username: client.user.username,
    servers: client.guilds.cache.size,
    users: client.users.cache.size,
  });
});
app.get("/status/guild", async (req, res) => {
  const { guildId } = req.query;

  if (!guildId) {
    return res.status(400).json({ error: "Missing guildId" });
  }

  try {
    const guild = await client.guilds.fetch(guildId);
    if (!guild) return res.status(404).json({ error: "Guild not found" });

    res.json({
      guild,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch guild" });
  }
});

app.get("/client/getguilds", async (req, res) => {
  const { guilds } = req.query;

  if (!guilds) {
    return res.status(400).json({ error: "Missing guilds" });
  }
  const arr = guilds.split(",");
  let fetched = [];
  try {
    for (var i = 0; i < arr.length; i++) {
      try {
        const guild = await client.guilds.fetch(arr[i]);
        if (!guild) continue;
        fetched.push(guild);
      } catch (error) {
        continue;
      }
    }
    res.json({ guilds: fetched });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch guild" });
  }
});

app.get("/guild/get", async (req, res) => {
  const { guildId } = req.query;
  if (!guildId) {
    return res.status(400).json({ error: "Missing guildId" });
  }
  try {
    const guild = await Server.getServer({ serverID: guildId });
    if (!guild) return res.status(404).json({ error: "Guild not found" });
    res.json({ guild });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch guild" });
  }
});
app.get("/guild/edit", async (req, res) => {
  const { guild, key, value } = req.query;
  if (!key || !value || !guild) {
    return res.status(400).json({ error: "Missing required parameters" });
  }
  try {
    await Server.updateSetting({ serverID: guild, key, value });
    res.json({ success: "Setting updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update setting" });
  }
});

export const startAPI = () => {
  app.listen(port, () => {
    console.log(`API is running on port ${port}`);
  });
};
