import pkg from "pg";
const { Client } = pkg;

// Database connection details
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000, // Increase timeout to 10 seconds
});

client
  .connect()
  .then(() => console.log("Connected to database"))
  .catch((err) => console.error("Connection error", err.stack));

// Load server settings
export async function loadSettings() {
  const res = await client.query("SELECT * FROM server_settings");
  const settings = res.rows.reduce((acc, row) => {
    acc[row.server_id] = row.settings;
    return acc;
  }, {});
  return settings;
}

// Save server settings
export async function saveSettings(settings) {
  // Loop through each server and insert or update in the database
  for (const [serverId, serverSettings] of Object.entries(settings)) {
    await client.query(
      "INSERT INTO server_settings (server_id, settings) VALUES ($1, $2) ON CONFLICT (server_id) DO UPDATE SET settings = $2",
      [serverId, serverSettings]
    );
  }
}

// Get settings for a specific server
export async function getServerSettings(serverId) {
  const res = await client.query(
    "SELECT settings FROM server_settings WHERE server_id = $1",
    [serverId]
  );
  return res.rows[0]?.settings || {}; // Return an empty object if not found
}

// Update settings for a specific server
export async function updateServerSettings(serverId, newSettings) {
  const settings = await loadSettings();
  settings[serverId] = { ...settings[serverId], ...newSettings };
  await saveSettings(settings);
}
