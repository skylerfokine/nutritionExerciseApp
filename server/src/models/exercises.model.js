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

export async function searchExercises({ search = "", limit = 20, offset = 0 }) {
  const lim = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const off = Math.max(Number(offset) || 0, 0);

  const params = [];
  let where = "";
  if (search && search.trim() !== "") {
    where = "WHERE title LIKE ?";
    params.push(`%${search.trim()}%`);
  }

  const sql = `
    SELECT id, title, body_part, equipment, level
    FROM exercises
    ${where}
    ORDER BY title ASC
    LIMIT ${lim} OFFSET ${off}
  `;

  const [rows] = await pool.query(sql, params);
  return rows;
}
