import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "servers.json");

// Load server settings
export function loadSettings() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({})); // Create file if it doesn't exist
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

// Save server settings
export function saveSettings(settings) {
  fs.writeFileSync(filePath, JSON.stringify(settings, null, 2));
}

// Get settings for a specific server
export function getServerSettings(serverId) {
  const settings = loadSettings();
  return settings[serverId] || {};
}

// Update settings for a specific server
export function updateServerSettings(serverId, newSettings) {
  const settings = loadSettings();
  settings[serverId] = { ...settings[serverId], ...newSettings };
  saveSettings(settings);
}
