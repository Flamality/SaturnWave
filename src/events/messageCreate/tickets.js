import { TicketSystem } from "../../models/Tickets.js";

export default async (client, message) => {
  if (!message.channel.isThread()) return;

  try {
    const ticket = await TicketSystem.getTicket(
      message.guild.id,
      message.channel.id
    );
    if (ticket) {
      if (message.author.bot) {
        TicketSystem.addTranscriptLog(
          message.guild.id,
          ticket.ticketID,
          message.author.id,
          message.author.username,
          message.author.globalName,
          message.content,
          2
        );
        return;
      } else {
        if (ticket.status == "open") {
          TicketSystem.addTranscriptLog(
            message.guild.id,
            ticket.ticketID,
            message.author.id,
            message.author.username,
            message.author.globalName,
            message.content,
            1
          );
        } else {
          await message.delete();
          await message.channel.setArchived(true);
        }
      }
    }
  } catch (error) {
    console.error("Failed to fetch the thread:", error);
  }
};
