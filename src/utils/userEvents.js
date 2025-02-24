import { EmbedBuilder } from "discord.js";

export const messageUser = async (
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

export const modActionDM = async ({
  client,
  interaction,
  userID,
  action,
  actionLine,
  targetUser,
  reason = null,
  duration = null,
  expires = null,
  extraInfo = null,
}) => {
  const embed = new EmbedBuilder()
    .setColor(0xffffff)
    .setTitle("User " + action ?? "Mod Action")
    .setDescription(
      `You have been ${actionLine} in **${interaction.guild.name}**.`
    )
    .setTimestamp();
  if (interaction.guild) {
    embed.setFooter({
      text: interaction.guild.name,
      iconURL: interaction.guild.iconURL({ dynamic: true, size: 2048 }),
    });
  }

  if (reason) {
    embed.addFields({
      name: "Reason:",
      value: reason,
    });
  }

  if (duration) {
    embed.addFields({
      name: "Duration:",
      value: String(duration),
    });
  }

  if (expires) {
    embed.addFields({
      name: "Expires:",
      value: `<t:${Math.floor(expires / 1000)}:R>`,
    });
  }

  if (extraInfo) {
    embed.addFields({
      name: "Extra Info:",
      value: extraInfo,
    });
  }

  try {
    const user = await client.users.fetch(userID);
    if (!user) return false;
    await user.send({ embeds: [embed] });
    return true;
  } catch (error) {
    console.error(`Failed to send message to ${userID}:`, error);
    return false;
  }
};

export const modActionMessage = async ({
  interaction,
  success = true,
  action,
  actionLine,
  targetUser,
  dmStatus = "none",
  reason = null,
  duration = null,
  expires = null,
  extraInfo = null,
}) => {
  const embed = new EmbedBuilder()
    .setColor(success ? 0xffffff : 0x900000)
    .setTitle("Mod Action // " + action ?? "Mod Action")
    .setDescription(
      (success
        ? "<:checkmark:1342977846741696542> "
        : "<:crossmark:1342977857239912500> ") +
        (actionLine ?? `Action ${action ?? "mod action"} was performed.`)
    )
    .setTimestamp();
  if (interaction.guild) {
    embed.setFooter({
      text: interaction.guild.name,
      iconURL: interaction.guild.iconURL({ dynamic: true, size: 2048 }),
    });
  }

  if (reason) {
    embed.addFields({
      name: "Reason:",
      value: reason,
    });
  }

  if (duration) {
    embed.addFields({
      name: "Duration:",
      value: String(duration),
    });
  }
  if (expires) {
    embed.addFields({
      name: "Expires:",
      value: `<t:${Math.floor(expires / 1000)}:R>`,
    });
  }

  if (extraInfo) {
    embed.addFields({
      name: "Extra Info:",
      value: extraInfo,
    });
  }
  if (dmStatus != "none") {
    embed.addFields({
      name: `DM`,
      value: dmStatus
          ? "<:checkmark:1342977846741696542>"
          : "<:crossmark:1342977857239912500>",
    });
  }
  if (interaction.isCommand?.()) {
    await interaction.editReply({ embeds: [embed] });
  } else {
    await interaction.reply({ embeds: [embed] });
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
    .setColor(0xff0000)
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
export const modActionFollowupFail = async (
  interaction,
  status,
  command,
  target,
  message
) => {
  const embed = new EmbedBuilder()
    .setColor(0xff0000)
    .setTimestamp()
    .setTitle("Mod Action // " + capitalize(command))
    .setDescription(
      `<:crossmark:1342977857239912500> Failed to ${command} ${target}`
    );

  if (message) embed.addFields({ name: "Message", value: message });

  if (interaction.isCommand?.()) {
    await interaction.editReply({ embeds: [embed] });
  } else {
    await interaction.reply({ embeds: [embed] });
  }
};

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
    .setColor(0xffffff)
    .setTimestamp()
    .setTitle("Mod Action // " + capitalize(command));
  if (status) {
    embed.setDescription(
      `<:checkmark:1342977846741696542> ${command} ${target}.`
    );
  } else {
    embed.setDescription(
      `<:crossmark:1342977857239912500> Failed to ${command} ${target}.`
    );
  }

  if (reason) embed.addFields({ name: "Reason", value: reason });
  if (duration) embed.addFields({ name: "Duration", value: duration });
  if (proof) embed.addFields({ name: "Proof", value: proof });

  if (interaction.isCommand?.()) {
    await interaction.editReply({ embeds: [embed] });
  } else {
    await interaction.reply({ embeds: [embed] });
  }
};
