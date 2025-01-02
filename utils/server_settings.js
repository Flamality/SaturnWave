import { dbclient } from "../index.js";

export async function loadSettings() {
  const res = await dbclient.query("SELECT * FROM server_settings");
  const settings = res.rows.reduce((acc, row) => {
    acc[row.server_id] = row.settings;
    return acc;
  }, {});
  return settings;
}

export async function saveSettings(settings) {
  for (const [serverId, serverSettings] of Object.entries(settings)) {
    await dbclient.query(
      "INSERT INTO server_settings (server_id, settings) VALUES ($1, $2) ON CONFLICT (server_id) DO UPDATE SET settings = $2",
      [serverId, serverSettings]
    );
  }
}

export async function getServerSettings(serverId) {
  const res = await dbclient.query(
    "SELECT settings FROM server_settings WHERE server_id = $1",
    [serverId]
  );
  return res.rows[0]?.settings || {};
}

export async function updateServerSettings(serverId, newSettings) {
  const settings = await loadSettings();
  settings[serverId] = { ...settings[serverId], ...newSettings };
  await saveSettings(settings);
}
