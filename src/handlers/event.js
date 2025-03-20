import { fileURLToPath, pathToFileURL } from "url";
import path from "path";
import { getAllFiles } from "../utils/getAllFiles.js";

export default (client) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const eventFolders = getAllFiles(path.join(__dirname, "..", "events"), true);

  for (const eventFolder of eventFolders) {
    const eventFiles = getAllFiles(eventFolder);
    eventFiles.sort((a, b) => a > b);
    const eventName = eventFolder.replace(/\\/g, "/").split("/").pop();

    client.on(eventName, async (arg) => {
      for (const eventFile of eventFiles) {
        const { default: eventFunction } = await import(
          pathToFileURL(eventFile).href
        );
        await eventFunction(client, arg);
      }
    });
  }
};
