import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { Server } from "../../models/Settings.js";
import {
  modActionMessage,
} from "../../utils/userEvents.js";

export default {
  callback: async (client, interaction, commandData) => {
    const userID = commandData.args[0].replace(/[<@!>]/g, "");
    let targetUser;
    try {
      targetUser = await interaction.guild.members.fetch(userID);
    } catch (error) {
      await modActionMessage({
        interaction,
        success: false,
        action: "Cases",
        actionLine: "Cannot find user.",
      });
      return;
    }

    // Fetch all cases for the user
    let cases;
    try {
      cases = await Server.getCases({ userID });
    } catch (err) {
      console.log(err);
      await modActionMessage({
        interaction,
        success: false,
        action: "Cases",
        actionLine: "Error when fetching cases.",
      });
      return;
    }

    // If the user has no cases
    if (!cases || cases.length === 0) {
      await modActionMessage({
        interaction,
        action: "Cases",
        actionLine: "User has no cases.",
      });
      return;
    }

    // Build the embed
    const embed = new EmbedBuilder()
      .setTitle(`${targetUser.user.tag}'s Cases`)
      .setColor("#5865F2")
      .setFooter({
        text: `Requested by ${commandData.author.tag}`,
        iconURL: commandData.author.displayAvatarURL({ dynamic: true }),
      });

    // Add each case to the embed description
    let casesDescription = "";
    cases.forEach((userCase, index) => {
      casesDescription += `
**Case #${index + 1}:** ${userCase.type}  
**Reason:** ${userCase.reason} 
**Expires:** <t:${Math.floor(userCase.expires / 1000)}:R>  
**Proof:** ${userCase.proof}
**Case #:** ${userCase.caseNumber}\n`;
    });

    // Set the embed description
    embed.setDescription(casesDescription);

    // Send the embed to the interaction
    await interaction.reply({ embeds: [embed] });
  },
  name: "cases",
  description: "Get a user's cases.",
  devOnly: false,
  testOnly: false,
  permissionsRequired: [PermissionFlagsBits.ModerateMembers],
  botPermissionsRequired: [PermissionFlagsBits.ModerateMembers],
  options: [
    {
      name: "user",
      description: "View this user's cases.",
      required: true,
      type: ApplicationCommandOptionType.User,
    },
  ],
};
