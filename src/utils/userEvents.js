import { EmbedBuilder } from "discord.js";

export const messagePlayer = async (
  client,
  userID,
  content = null,
  embeds = []
) => {
  try {
    const user = await client.users.fetch(userID);
    if (!user) throw new Error("User not found.");

    const payload = {};
    if (content) payload.content = content;
    if (embeds.length > 0) payload.embeds = embeds;

    if (!content && embeds.length === 0) {
      throw new Error("No content or embeds provided.");
    }

    await user.send(payload);
    return true;
  } catch (error) {
    console.error(`Failed to send message to ${userID}:`, error);
    return false;
  }
};

export const commandFollowupSuccess = async ({
  interaction,
  command,
  description,
  fields,
}) => {
  const embed = new EmbedBuilder()
    .setColor(0x00ff00)
    .setTitle(command ?? "User command")
    .setDescription(description ?? "Command executed successfully.")
    .setTimestamp();

  if (fields) {
    for (const field of fields) {
      embed.addFields({
        name: field.name,
        value: field.value,
        inline: field.inline ?? false,
      });
    }
  }
  await interaction.editReply({ embeds: [embed] });
};
export const commandFollowupFail = async ({
  interaction,
  command,
  description,
  fields,
}) => {
  const embed = new EmbedBuilder()
    .setColor(0x00ff00)
    .setTitle(command ?? "User command")
    .setDescription(description ?? "Command failed to execute.")
    .setTimestamp();

  if (fields) {
    for (const field of fields) {
      embed.addFields({
        name: field.name,
        value: field.value,
        inline: field.inline ?? false,
      });
    }
  }
  await interaction.editReply({ embeds: [embed] });
};
function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
export const modActionFollowup = async (
  interaction,
  status,
  command,
  target,
  reason,
  proof,
  duration
) => {
  const embed = new EmbedBuilder()
    .setColor(0x800080)
    .setTimestamp()
    .setTitle("Mod Action // " + capitalize(command));
  if (status) {
    embed.setDescription(
      `<:checkmark:1342977846741696542> ${command} @${target.user.username}.`
    );
  } else {
    embed.setDescription(
      `<:crossmark:1342977857239912500> ${command} ${target.user.username}.`
    );
  }

  if (reason) embed.addFields({ name: "Reason", value: reason });
  if (duration) embed.addFields({ name: "Duration", value: duration });
  if (proof) embed.addFields({ name: "Proof", value: proof });

  await interaction.editReply({ embeds: [embed] });
};

// export const sendCommandStatus = ({
//   interaction,
//   command,
//   status,
//   proof,
//   duration,
//   target,
//   targetline,
// }) => {
//   const embed = new EmbedBuilder()
//     .setColor(status ? 0x00ff00 : 0xff0000)
//     .setTitle(command ?? "Command Status");

//   if (status) {
//     embed.setDescription(
//       target?.username
//         ? `<:checkmark:1342977846741696542> ${
//             target.username
//           } was successfully ${targetline ?? "processed"}.`
//         : "Command executed successfully."
//     );
//   } else {
//     embed.setDescription(
//       target?.username
//         ? `<:crossmark:1342977857239912500> Failed to ${
//             command?.toLowerCase() ?? "execute command"
//           } ${target.username}.`
//         : `<:crossmark:1342977857239912500> Failed to execute ${
//             command ?? "the command"
//           }.`
//     );
//   }

//   // Add optional fields only if provided
//   if (duration) embed.addFields({ name: "⏳ Duration", value: duration });
//   if (proof) embed.addFields({ name: "📄 Proof", value: proof });

//   // Safely edit the reply and catch any potential issues
//   interaction.editReply({ embeds: [embed] }).catch(console.error);
// };
