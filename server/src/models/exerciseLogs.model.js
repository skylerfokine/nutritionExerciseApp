// src/models/exerciseLogs.model.js
// PATCH helper for editing an existing workout log row that belongs to a user.
// NOTE: Your DB table name is user_exercise_logs (not exercise_logs).

import { pool } from "../db/pool.js";

/**
 * Update a single exercise log that belongs to a user.
 * `fields` may include: sets, reps, weight_kg, duration_min
 * Returns the updated row or null if not found/owned by user.
 */
export async function updateExerciseLogForUser({ logId, userId, fields }) {
  const allowed = ["sets", "reps", "weight_kg", "duration_min"];
  const keys = allowed.filter((k) => fields[k] !== undefined);
  if (keys.length === 0) return null;

  const setSql = keys.map((k) => `${k} = ?`).join(", ");
  const params = keys.map((k) => fields[k]);

  // IMPORTANT: use your actual table name: user_exercise_logs
  const sql = `
    UPDATE user_exercise_logs
    SET ${setSql}
    WHERE id = ? AND user_id = ?
    LIMIT 1
  `;
  params.push(logId, userId);

  const [result] = await pool.execute(sql, params);
  if (result.affectedRows === 0) return null;

  const [rows] = await pool.execute(
    `SELECT id, user_id, exercise_id, log_date, sets, reps, weight_kg, duration_min
     FROM user_exercise_logs
     WHERE id = ?`,
    [logId],
  );
  return rows[0] || null;
}
