import { getAllFiles } from "./getAllFiles.js";
import { fileURLToPath, pathToFileURL } from "url";
import path from "path";

export default async (exceptions = []) => {
  let localCommands = [];

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const commandCategories = getAllFiles(
    path.join(__dirname, "..", "commands"),
    true
  );

  for (const commandCategory of commandCategories) {
    const commandFiles = getAllFiles(commandCategory);

    for (const commandFile of commandFiles) {
      const commandObject = await import(pathToFileURL(commandFile).href);
      if (exceptions.includes(commandObject.name)) continue;
      localCommands.push(commandObject);
    }
  }
  return localCommands;
};
