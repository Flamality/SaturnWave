import {
  getServerSettings,
  updateServerSettings,
} from "../utils/server_settings.js";
import { dbclient } from "../index.js";
import { v4 } from "uuid";
export async function fetchXP(serverId, userId) {
  try {
    const res = await dbclient.query(
      `SELECT * FROM rank_prod WHERE sid = $1 AND uid = $2`,
      [serverId, userId]
    );

    if (res.rows.length > 0) {
      return res.rows[0].xp;
    }
  } catch (err) {
    console.error(err);
    return 0;
  }
  return 0;
}

export async function setXP(serverId, userId, xp) {
  try {
    const updateResult = await dbclient.query(
      `UPDATE rank_prod
       SET xp = $3
       WHERE sid = $1 AND uid = $2`,
      [serverId, userId, xp]
    );

    if (updateResult.rowCount === 0) {
      await dbclient.query(
        `INSERT INTO activity_prod (sid, uid, xp)
         VALUES ($1, $2, $3)`,
        [serverId, userId, xp]
      );
    } else {
    }
  } catch (err) {
    console.log(err);
  }
}
