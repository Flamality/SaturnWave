import { fetchXP } from "./levels_utils";

export async function manageXPOnMessage(msg) {
  const author = msg.author;
  if (author.bot) return;
  function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  const xpInc = getRandomNumber(2, 5);

  fetchXP(msg.guildId, author.id);
}
