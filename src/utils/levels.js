import { createCanvas, loadImage } from "canvas";

async function createRankCard(userData) {
  const canvas = createCanvas(600, 180);
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createLinearGradient(0, 0, 600, 180);
  gradient.addColorStop(0, "#4158D0");
  gradient.addColorStop(0.46, "#C850C0");
  gradient.addColorStop(1, "#FFCC70");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 600, 180);

  ctx.globalAlpha = 0.05;
  for (let i = 0; i < 600; i += 20) {
    for (let j = 0; j < 180; j += 20) {
      if ((i + j) % 40 === 0) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(i, j, 10, 10);
      }
    }
  }
  ctx.globalAlpha = 1;

  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.beginPath();
  ctx.roundRect(20, 20, 560, 140, 15);
  ctx.fill();

  const avatarSize = 80;
  const avatarX = 40;
  const avatarY = 40;

  ctx.save();

  ctx.shadowColor = "#FFF";
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(
    avatarX + avatarSize / 2,
    avatarY + avatarSize / 2,
    avatarSize / 2 + 3,
    0,
    Math.PI * 2
  );
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.closePath();

  ctx.shadowBlur = 0;

  ctx.beginPath();
  ctx.arc(
    avatarX + avatarSize / 2,
    avatarY + avatarSize / 2,
    avatarSize / 2,
    0,
    Math.PI * 2
  );
  ctx.closePath();
  ctx.clip();

  const avatarImage = await loadImage(
    `https://cdn.discordapp.com/avatars/${userData.userID}/${userData.avatarHash}.png`
  );
  ctx.drawImage(avatarImage, avatarX, avatarY, avatarSize, avatarSize);

  ctx.restore();

  ctx.save();
  const usernameGradient = ctx.createLinearGradient(140, 50, 400, 50);
  usernameGradient.addColorStop(0, "#FFFFFF");
  usernameGradient.addColorStop(1, "#FFD700");
  ctx.fillStyle = usernameGradient;
  ctx.font = "bold 28px 'Arial', sans-serif";
  ctx.fillText(userData.username, 140, 70);
  ctx.restore();

  const statsX = 140;
  const statsY = 90;
  const statSpacing = 120;

  function drawStat(x, y, label, value, color) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = "500 14px 'Arial', sans-serif";
    ctx.fillText(label, x, y);

    ctx.fillStyle = color;
    ctx.font = "bold 20px 'Arial', sans-serif";
    ctx.fillText(value, x, y + 25);
  }

  drawStat(statsX, statsY, "Level", userData.level, "#7AFFD0");
  drawStat(
    statsX + statSpacing,
    statsY,
    "Rank",
    `#${userData.serverRank}`,
    "#FF7AD6"
  );
  drawStat(
    statsX + statSpacing * 2,
    statsY,
    "XP",
    `${userData.xp}/${userData.neededXP}`,
    "#FFD700"
  );

  const progressBarY = 140;
  const progressBarWidth = 520;
  const progressBarHeight = 12;
  const progress =
    ((userData.xp - userData.lastLevelXP) /
      (userData.neededXP - userData.lastLevelXP)) *
    progressBarWidth;

  const bgGradient = ctx.createLinearGradient(40, 0, progressBarWidth + 40, 0);
  bgGradient.addColorStop(0, "rgba(255, 255, 255, 0.1)");
  bgGradient.addColorStop(1, "rgba(255, 255, 255, 0.2)");

  ctx.beginPath();
  ctx.roundRect(
    40,
    progressBarY,
    progressBarWidth,
    progressBarHeight,
    progressBarHeight / 2
  );
  ctx.fillStyle = bgGradient;
  ctx.fill();

  const progressGradient = ctx.createLinearGradient(
    40,
    0,
    progressBarWidth + 40,
    0
  );
  progressGradient.addColorStop(0, "#7AFFD0");
  progressGradient.addColorStop(0.5, "#FF7AD6");
  progressGradient.addColorStop(1, "#FFD700");

  ctx.beginPath();
  ctx.roundRect(
    40,
    progressBarY,
    progress,
    progressBarHeight,
    progressBarHeight / 2
  );
  ctx.fillStyle = progressGradient;
  ctx.fill();

  ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
  ctx.beginPath();
  ctx.roundRect(
    40,
    progressBarY,
    progress,
    progressBarHeight / 2,
    progressBarHeight / 2
  );
  ctx.fill();

  return canvas.toBuffer();
}

export default createRankCard;

export const xpForLevel = (level, baseXP = 500, multiplier = 1.2) => {
  return Math.floor(baseXP * Math.pow(multiplier, level - 1));
};

export const getLevel = (xp, baseXP = 500, multiplier = 1.2) => {
  let level = 1;
  let totalXpNeeded = 0;

  while (xp >= totalXpNeeded) {
    totalXpNeeded = xpForLevel(level, baseXP, multiplier);
    if (xp >= totalXpNeeded) {
      level++;
    }
  }

  return level;
};

export const levelUp = (oldXP, newXP, baseXP = 500, multiplier = 1.2) => {
  const oldLevel = getLevel(oldXP, baseXP, multiplier);
  const newLevel = getLevel(newXP, baseXP, multiplier);

  return newLevel > oldLevel ? true : false;
};
