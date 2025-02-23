import { dbclient } from "../index.js";

export class Level {
  static async create({ userID, guildID, xp = 0 }) {
    const query = `
      INSERT INTO levels ("userid", "guildid", xp)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [userID, guildID, xp];
    try {
      const result = await dbclient.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Error creating level:", error);
      throw error;
    }
  }

  static async getRank({ userID, guildID }) {
    const query = `
      SELECT * FROM levels
      WHERE "guildid" = $1
      ORDER BY xp DESC;
    `;
    const values = [guildID];
    try {
      const result = await dbclient.query(query, values);
      const users = result.rows;

      const user = users.find((u) => u.userid === userID);

      if (!user) {
        return users.length + 1;
      }

      const rank = users.indexOf(user) + 1;
      return rank;
    } catch (error) {
      console.error("Error getting rank:", error);
      throw error;
    }
  }

  static async findOne({ userID, guildID }) {
    const query = `
      SELECT * FROM levels
      WHERE "userid" = $1 AND "guildid" = $2
      LIMIT 1;
    `;
    const values = [userID, guildID];
    try {
      const result = await dbclient.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Error finding level:", error);
      throw error;
    }
  }

  static async update({ userID, guildID, xp }) {
    const query = `
      UPDATE levels
      SET xp = $3
      WHERE "userid" = $1 AND "guildid" = $2
      RETURNING *;
    `;
    const values = [userID, guildID, xp];
    try {
      const result = await dbclient.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Error updating level:", error);
      throw error;
    }
  }
}
