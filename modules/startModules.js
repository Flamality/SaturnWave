import chalk from "chalk";
import { startInactivityCheck } from "./inactivity.js";

export const modulesInit = (client) => {
  // Initialize all modules here
  startInactivityCheck(client);

  console.log("Modules started!");
};
