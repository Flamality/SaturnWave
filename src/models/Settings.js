import { dbclient } from "../index.js";

import defaultSettings from "../../default.json" assert { type: "json" };

export class Server {
  static async getSetting(guildID, key) {
    if (isNaN(guildID) || guildID === null || guildID === undefined) {
      console.log(`Invalid guildID: ${guildID}`);
      console.log(JSON.stringify(guildID));
      return;
    }

    const query = `
    SELECT settings FROM servers
    WHERE "guildid" = $1
    LIMIT 1;
    `;
    const values = [BigInt(guildID)];
    try {
      const res = await dbclient.query(query, values);
      const settings =
        { ...defaultSettings, ...res.rows[0]?.settings } || defaultSettings;
      const value = key.split(".").reduce((obj, prop) => obj?.[prop], settings);
      return String(value.value);
    } catch (error) {
      console.error("Error getting setting:", error);
      return "Error getting setting";
    }
  }
  static async getSettings(guildID) {
    if (isNaN(guildID) || guildID === null || guildID === undefined) {
      console.log(`Invalid guildID: ${guildID}`);
      console.log(JSON.stringify(guildID));
      return;
    }

    const query = `
    SELECT settings FROM servers
    WHERE "guildid" = $1
    LIMIT 1;
    `;
    const values = [BigInt(guildID)];

    try {
      const res = await dbclient.query(query, values);
      const settings =
        { ...defaultSettings, ...res.rows[0]?.settings } || defaultSettings;
      return settings;
    } catch (error) {
      console.error("Error getting setting:", error);
      return "Error getting setting";
    }
  }
  static async updateSetting(guildID, key, value) {
    const query = `
    UPDATE servers
    SET settings = $1
    WHERE "guildid" = $2
    RETURNING settings;
    `;
    const settingsQuery = `
    SELECT settings FROM servers
    WHERE "guildid" = $1
    LIMIT 1;
    `;
    const findDefault = key
      .split(".")
      .reduce((obj, prop) => obj?.[prop], defaultSettings);
    if (!findDefault) return { error: "Couldn't find setting" };
    try {
      const currentSettingsResult = await dbclient.query(settingsQuery, [
        guildID,
      ]);
      let currentSettings = currentSettingsResult.rows[0]?.settings || {};
      let updatedSettings = JSON.parse(JSON.stringify(defaultSettings));
      Object.assign(updatedSettings, currentSettings);
      let keys = key.split(".");
      let settingRef = updatedSettings;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!settingRef[keys[i]]) return { error: "Invalid setting path" };
        settingRef = settingRef[keys[i]];
      }

      if (!settingRef[keys[keys.length - 1]])
        return { error: "Invalid setting key" };

      settingRef[keys[keys.length - 1]].value = value;
      await dbclient.query(query, [JSON.stringify(updatedSettings), guildID]);
      return true;
    } catch (error) {
      console.error("Error updating setting:", error);
      return false;
    }
  }
  // static async getSetting({ serverID, key }) {
  //   const query = `
  //     SELECT settings FROM servers
  //     WHERE "guildid" = $1
  //     LIMIT 1;
  //   `;
  //   const values = [serverID];

  //   try {
  //     const result = await dbclient.query(query, values);
  //     const serverData = result.rows[0];
  //     if (!serverData || Object.keys(serverData.settings || {}).length === 0) {
  //       return this.getNestedSetting(defaultSettings, key) || null;
  //     }
  //     const settings = serverData.settings || {};
  //     return this.getNestedSetting(settings, key);
  //   } catch (error) {
  //     console.error("Error getting setting:", error);
  //     throw error;
  //   }
  // }

  // // Helper function to get nested setting (if key is nested in JSON)
  // static getNestedSetting(settings, key) {
  //   const keys = key.split(".");
  //   let result = settings;

  //   for (const k of keys) {
  //     result = result[k];
  //     if (result === undefined) return null;
  //   }
  //   return result;
  // }

  // static async getSettings({ serverID }) {
  //   const query = `
  //     SELECT settings FROM servers
  //     WHERE "guildid" = $1
  //     LIMIT 1;
  //   `;
  //   const values = [serverID];
  //   try {
  //     const result = await dbclient.query(query, values);
  //     const serverData = result.rows[0];
  //     if (!serverData || Object.keys(serverData.settings || {}).length === 0) {
  //       return defaultSettings;
  //     }
  //     const settings = serverData.settings || {};
  //     return settings;
  //   } catch (error) {}
  // }
  // static async getServer({ serverID, attempts = 0 }) {
  //   if (attempts > 5)
  //     throw new Error("Max retry attempts reached for getServer");

  //   const query = `
  //     SELECT * FROM servers
  //     WHERE guildid = $1
  //     LIMIT 1;
  //   `;
  //   const values = [serverID];

  //   try {
  //     const result = await dbclient.query(query, values);
  //     const serverData = result.rows[0];
  //     console.log(
  //       serverData +
  //         " | " +
  //         serverData.settings +
  //         " | " +
  //         Object.keys(serverData.settings)
  //     );
  //     if (
  //       !serverData ||
  //       !serverData.settings ||
  //       Object.keys(serverData.settings || {}).length === 0
  //     ) {
  //       await this.initServer({ serverID });
  //       return await this.getServer({ serverID, attempts: attempts + 1 });
  //     }
  //     return serverData;
  //   } catch (error) {
  //     console.error("Database error in getServer:", error);
  //     throw error;
  //   }
  // }

  // static async initServer({ serverID }) {
  //   const query = `
  //   SELECT * FROM servers
  //   WHERE guildid = $1
  //   LIMIT 1;`;
  //   const values = [serverID];

  //   try {
  //     const result = await dbclient.query(query, values);
  //     console.log(result.rows[0]);
  //     const serverData = result.rows[0];

  //     if (serverData) {
  //       if (
  //         !serverData.settings ||
  //         Object.keys(serverData.settings || {}).length === 0
  //       ) {
  //         const newSettingsQuery = `
  //         UPDATE servers
  //         SET settings = $2
  //         WHERE guildid = $1
  //         RETURNING *;`;
  //         const settingsValues = [serverID, JSON.stringify(defaultSettings)];
  //         await dbclient.query(newSettingsQuery, settingsValues);
  //       }
  //     } else {
  //       const newServerQuery = `
  //       INSERT INTO servers (guildid, settings)
  //       VALUES ($1, $2)
  //       ON CONFLICT (guildid) DO UPDATE
  //       SET settings = EXCLUDED.settings
  //       RETURNING *;`;
  //       const newServerValues = [serverID, JSON.stringify(defaultSettings)];
  //       await dbclient.query(newServerQuery, newServerValues);
  //     }
  //   } catch (error) {
  //     console.error("Database error in initServer:", error);
  //   }
  // }

  // // Update a specific setting for the server
  // static async updateSetting({ serverID, key, value }) {
  //   const query = `
  //     SELECT settings FROM servers
  //     WHERE "guildid" = $1
  //     LIMIT 1;
  //   `;
  //   const values = [serverID];

  //   try {
  //     const result = await dbclient.query(query, values);
  //     const serverData = result.rows[0];

  //     if (!serverData) {
  //       console.error("Server not found");
  //       return null;
  //     }

  //     const settings = serverData.settings || {};
  //     const updatedSettings = { ...settings };

  //     // Update the setting
  //     const keys = key.split(".");
  //     let temp = updatedSettings;

  //     // Traverse to the correct nested key
  //     for (let i = 0; i < keys.length - 1; i++) {
  //       temp = temp[keys[i]] = temp[keys[i]] || {};
  //     }

  //     temp[keys[keys.length - 1]] = value;

  //     // Update the database with the new settings
  //     const updateQuery = `
  //       UPDATE servers
  //       SET settings = $2
  //       WHERE "guildid" = $1
  //       RETURNING *;
  //     `;
  //     const updateValues = [serverID, JSON.stringify(updatedSettings)];
  //     await dbclient.query(updateQuery, updateValues);

  //     return updatedSettings;
  //   } catch (error) {
  //     console.error("Error updating setting:", error);
  //     throw error;
  //   }
  // }

  // Get all cases for a specific user by userID

  static async createTicket(serverID, userID) {
    const query = `
    INSERT INTO servers (guildid, cases)
    `;
  }
  static async getCases({ userID }) {
    const query = `
  SELECT cases FROM servers
  WHERE cases::jsonb @> '[{"user": "${userID}"}]'::jsonb;
`;

    try {
      const result = await dbclient.query(query);
      const serverData = result.rows;

      if (!serverData || serverData.length === 0) {
        return [];
      }

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

  static async addCase({ serverID, userID, type, reason, expires, proof }) {
    const getCurrentCaseNumberQuery = `
      SELECT jsonb_array_length(cases) AS case_count
FROM servers
WHERE "guildid" = $1;
    `;
    const values = [serverID];

    try {
      const result = await dbclient.query(getCurrentCaseNumberQuery, values);
      const maxCaseNumber = result.rows[0]?.case_count || 0;
      const newCaseNumber = maxCaseNumber + 1;

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
