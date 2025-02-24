import { dbclient } from "../index.js";

import defaultSettings from "../../default.json" assert { type: "json" };

export class Server {
  static async getSetting({ serverID, key }) {
    const query = `
      SELECT settings FROM servers
      WHERE "guildid" = $1
      LIMIT 1;
    `;
    const values = [serverID];

    try {
      const result = await dbclient.query(query, values);
      const serverData = result.rows[0];

      if (!serverData) {
        // If no server data found, return the default value for the key if available
        return defaultSettings[key] || null;
      }

      const settings = serverData.settings || {};
      return this.getNestedSetting(settings, key);
    } catch (error) {
      console.error("Error getting setting:", error);
      throw error;
    }
  }

  // Helper function to get nested setting (if key is nested in JSON)
  static getNestedSetting(settings, key) {
    const keys = key.split(".");
    let result = settings;

    for (const k of keys) {
      result = result[k];
      if (result === undefined) return null;
    }
    return result;
  }

  // Update a specific setting for the server
  static async updateSetting({ serverID, key, value }) {
    const query = `
      SELECT settings FROM servers
      WHERE "guildid" = $1
      LIMIT 1;
    `;
    const values = [serverID];

    try {
      const result = await dbclient.query(query, values);
      const serverData = result.rows[0];

      if (!serverData) {
        console.error("Server not found");
        return null;
      }

      const settings = serverData.settings || {};
      const updatedSettings = { ...settings };

      // Update the setting
      const keys = key.split(".");
      let temp = updatedSettings;

      // Traverse to the correct nested key
      for (let i = 0; i < keys.length - 1; i++) {
        temp = temp[keys[i]] = temp[keys[i]] || {};
      }

      temp[keys[keys.length - 1]] = value;

      // Update the database with the new settings
      const updateQuery = `
        UPDATE servers
        SET settings = $2
        WHERE "guildid" = $1
        RETURNING *;
      `;
      const updateValues = [serverID, JSON.stringify(updatedSettings)];
      await dbclient.query(updateQuery, updateValues);

      return updatedSettings;
    } catch (error) {
      console.error("Error updating setting:", error);
      throw error;
    }
  }

  // Get all cases for a specific user by userID
  static async getCases({ userID }) {
    const query = `
  SELECT cases FROM servers
  WHERE cases::jsonb @> '[{"user": "${userID}"}]'::jsonb;
`;

    try {
      const result = await dbclient.query(query);
      const serverData = result.rows;

      if (!serverData || serverData.length === 0) {
        return []; // No cases found for the user
      }

      // Extract cases from all servers
      const cases = [];
      serverData.forEach((row) => {
        row.cases.forEach((userCase) => {
          if (userCase.user == userID) {
            cases.push(userCase);
          }
        });
      });

      return cases;
    } catch (error) {
      console.error("Error getting cases:", error);
      throw error;
    }
  }

  // Add a case to the guild with a generated case number
  static async addCase({ serverID, userID, type, reason, expires, proof }) {
    const getCurrentCaseNumberQuery = `
      SELECT MAX((cases ->> 'caseNumber')::int) AS max_case_number
      FROM servers
      WHERE "guildid" = $1;
    `;
    const values = [serverID];

    try {
      const result = await dbclient.query(getCurrentCaseNumberQuery, values);
      const maxCaseNumber = result.rows[0]?.max_case_number || 0;
      const newCaseNumber = maxCaseNumber + 1; // Case number increments by 1

      const newCase = {
        caseNumber: newCaseNumber,
        user: userID,
        type,
        reason,
        expires,
        proof,
      };

      const query = `
      SELECT cases FROM servers
      WHERE "guildid" = $1
      LIMIT 1;
    `;
      const caseValues = [serverID];

      const serverResult = await dbclient.query(query, caseValues);
      const serverData = serverResult.rows[0];

      if (!serverData) {
        // If no server data found, initialize the cases field as an empty array
        const insertQuery = `
        INSERT INTO servers ("guildid", settings, cases)
        VALUES ($1, '{}'::jsonb, '[]'::jsonb)
        RETURNING *;
      `;
        await dbclient.query(insertQuery, caseValues);
      }

      const updateQuery = `
      UPDATE servers
      SET cases = cases || $2::jsonb
      WHERE "guildid" = $1
      RETURNING *;
    `;
      const updateValues = [serverID, JSON.stringify([newCase])];
      await dbclient.query(updateQuery, updateValues);

      return newCase;
    } catch (error) {
      console.error("Error adding case:", error);
      throw error;
    }
  }
}
