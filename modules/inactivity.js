import { EmbedBuilder } from "discord.js";
import {
  getServerSettings,
  updateServerSettings,
} from "../utils/server_settings.js";
import {
  getLastActivityTimestamp,
  updateLastActivityTimestamp,
} from "./activity_utils.js";

const INACTIVITY_CHECK_INTERVAL = 3000 * 60 * 5;
export async function startInactivityCheck(client) {
  setInterval(async () => {
    client.guilds.cache.forEach(async (guild) => {
      const serverId = guild.id;
      const settings = await getServerSettings(serverId);

      const ignoreRoles = settings.inactivityBlacklist; // Get roles to be ignored

      const inactivityPeriod = settings.inactivityPeriod * 60 * 60 * 1000;
      const currentTime = Date.now();

      if (
        settings.modules.inactivity === false ||
        !settings.modules.inactivity ||
        !settings.inactivityPeriod
      ) {
        try {
          await guild.members.fetch();
        } catch (error) {
          if (error.name === "GuildMembersTimeout") {
            return;
          }
        }
      }

      for (const member of guild.members.cache.values()) {
        if (member.bot) continue;

        // Check if the member has any of the roles in the ignore list
        const hasIgnoredRole = member.roles.cache.some((role) =>
          ignoreRoles.includes(role.id)
        );

        if (hasIgnoredRole) {
          continue; // Skip this member if they have an ignored role
        }

        const lastActivity = await getLastActivityTimestamp(
          serverId,
          member.id
        );
        if (!lastActivity) {
          await updateUserActivity(serverId, member.id);
          continue;
        }

        if (currentTime - lastActivity >= inactivityPeriod) {
          console.log("User is past inactivity period");
          let dmSent = false;

          const kickEmbed = new EmbedBuilder()
            .setColor("#ff0000")
            .setTitle(`Kicked For Inactivity`)
            .setDescription(
              `You have been removed from the server **${guild.name}** due to inactivity. We value your participation, and we hope to see you back soon!`
            )
            .addFields({ name: "Reason:", value: "Inactivity" })
            .setTimestamp()
            .setFooter({ text: "Thank you for being part of our community." });

          try {
            await member.send({ embeds: [kickEmbed] });
            dmSent = true;
          } catch (error) {
            dmSent = false;
          }

          try {
            await member.kick("Inactivity.");
          } catch (error) {
            updateLastActivityTimestamp(guild.id, member.user.id);
          }
        }
      }
    });
  }, INACTIVITY_CHECK_INTERVAL);
}

export async function updateUserActivity(guildId, userId) {
  const currentTime = Date.now();
  await updateLastActivityTimestamp(guildId, userId, currentTime);
}
