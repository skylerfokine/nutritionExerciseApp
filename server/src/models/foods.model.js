import { pool } from "../db/pool.js";

export async function getFoodById(foodId) {
  const sql = `
    SELECT id, name,
           calories_kcal, protein_g, fat_g, carbs_g
    FROM foods
    WHERE id = ?
    LIMIT 1
  `;
  const [rows] = await pool.execute(sql, [foodId]);
  return rows[0] || null; // controller handles null -> 404
}
