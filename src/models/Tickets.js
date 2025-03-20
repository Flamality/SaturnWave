import { dbclient } from "../index.js";

export class TicketSystem {
  static async createTicket(serverID, ticketID, creator) {
    const query = `
      SELECT tickets FROM servers WHERE "guildid" = $1 LIMIT 1;
    `;
    const values = [serverID];

    try {
      const result = await dbclient.query(query, values);
      let serverData = result.rows[0];

      if (!serverData) {
        const insertQuery = `
          INSERT INTO servers ("guildid", settings, tickets)
          VALUES ($1, '{}'::jsonb, '[]'::jsonb)
          RETURNING *;
        `;
        await dbclient.query(insertQuery, values);
        serverData = { tickets: [] };
      }

      const newTicket = {
        ticketID,
        creator,
        status: "open",
        transcript: [],
      };

      const updateQuery = `
        UPDATE servers
        SET tickets = tickets || $2::jsonb
        WHERE "guildid" = $1
        RETURNING *;
      `;
      const updateValues = [serverID, JSON.stringify([newTicket])];
      await dbclient.query(updateQuery, updateValues);

      return newTicket;
    } catch (error) {
      console.error("Error creating ticket:", error);
      throw error;
    }
  }

  static async getTicket(serverID, ticketID) {
    const query = `
      SELECT ticket
      FROM (
        SELECT jsonb_array_elements(tickets) AS ticket
        FROM servers
        WHERE guildid = $1
      ) AS ticket_list
      WHERE ticket->>'ticketID' = $2;
    `;
    const values = [serverID, ticketID];

    try {
      const result = await dbclient.query(query, values);
      return result.rows[0]?.ticket || null;
    } catch (error) {
      console.error("Error retrieving ticket:", error);
      throw error;
    }
  }

  static async addTranscriptLog(
    serverID,
    ticketID,
    creatorUID,
    creatorUserName,
    creatorNickName,
    content,
    logType
  ) {
    const query = `
      SELECT tickets FROM servers WHERE "guildid" = $1;
    `;
    const values = [serverID];

    try {
      const result = await dbclient.query(query, values);
      const serverData = result.rows[0];

      if (!serverData || !serverData.tickets) {
        throw new Error("No tickets found for this server.");
      }

      const tickets = serverData.tickets;
      const ticketIndex = tickets.findIndex(
        (ticket) => ticket.ticketID === ticketID
      );

      if (ticketIndex === -1) {
        throw new Error("Ticket not found.");
      }

      const newLog = {
        timestamp: new Date().toISOString(),
        creatorUID,
        creatorUserName,
        creatorNickName,
        content,
        logType,
      };

      tickets[ticketIndex].transcript.push(newLog);

      const updateQuery = `
        UPDATE servers
        SET tickets = $2::jsonb
        WHERE "guildid" = $1
        RETURNING *;
      `;
      const updateValues = [serverID, JSON.stringify(tickets)];
      await dbclient.query(updateQuery, updateValues);

      return newLog;
    } catch (error) {
      console.error("Error adding transcript log:", error);
      throw error;
    }
  }

  static async updateTicketStatus(serverID, ticketID, newStatus) {
    if (!["open", "closed", "deleted"].includes(newStatus)) {
      throw new Error(
        "Invalid status. Must be 'open', 'closed', or 'deleted'."
      );
    }

    const query = `
      SELECT tickets FROM servers WHERE "guildid" = $1;
    `;
    const values = [serverID];

    try {
      const result = await dbclient.query(query, values);
      const serverData = result.rows[0];

      if (!serverData || !serverData.tickets) {
        throw new Error("No tickets found for this server.");
      }

      const tickets = serverData.tickets;
      const ticketIndex = tickets.findIndex(
        (ticket) => ticket.ticketID === ticketID
      );

      if (ticketIndex === -1) {
        throw new Error("Ticket not found.");
      }

      tickets[ticketIndex].status = newStatus;

      const updateQuery = `
        UPDATE servers
        SET tickets = $2::jsonb
        WHERE "guildid" = $1
        RETURNING *;
      `;
      const updateValues = [serverID, JSON.stringify(tickets)];
      await dbclient.query(updateQuery, updateValues);

      return { ticketID, status: newStatus };
    } catch (error) {
      console.error("Error updating ticket status:", error);
      throw error;
    }
  }
}
