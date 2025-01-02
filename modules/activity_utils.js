import {
  getServerSettings,
  updateServerSettings,
} from "../utils/server_settings.js";
import { dbclient } from "../index.js";
import { v4 } from "uuid";
export async function getLastActivityTimestamp(serverId, userId) {
  try {
    const res = await dbclient.query(
      `SELECT * FROM activity_prod WHERE sid = $1 AND uid = $2`,
      [serverId, userId]
    );

    if (res.rows.length > 0) {
      return res.rows[0].timestamp;
    }
  } catch (err) {
    console.error(err);
    return false;
  }
  return false;
}

export async function updateLastActivityTimestamp(serverId, userId, timestamp) {
  try {
    const updateResult = await dbclient.query(
      `UPDATE activity_prod
       SET timestamp = $3
       WHERE sid = $1 AND uid = $2`,
      [serverId, userId, timestamp]
    );

    if (updateResult.rowCount === 0) {
      await dbclient.query(
        `INSERT INTO activity_prod (sid, uid, timestamp)
         VALUES ($1, $2, $3)`,
        [serverId, userId, timestamp]
      );
    } else {
    }
  } catch (err) {
    console.log(err);
  }
}
