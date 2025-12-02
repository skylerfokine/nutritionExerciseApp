// Minimal exercise lookup to validate exerciseId exists before logging.
import { pool } from "../db/pool.js";

export async function getExerciseById(exerciseId) {
  const sql = `
    SELECT id, title, level
    FROM exercises
    WHERE id = ?
    LIMIT 1
  `;
  const [rows] = await pool.execute(sql, [exerciseId]);
  return rows[0] || null;
}
