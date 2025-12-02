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

// List/search foods with pagination
/**
 * Search foods by name with pagination.
 * Only strings are parameterized; LIMIT/OFFSET are validated and inlined
 * to avoid "Incorrect arguments to mysqld_stmt_execute".
 */
export async function searchFoods({ search = "", limit = 20, offset = 0 }) {
  const lim = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const off = Math.max(Number(offset) || 0, 0);

  const params = [];
  let where = "";
  if (search && search.trim() !== "") {
    where = "WHERE name LIKE ?";
    params.push(`%${search.trim()}%`);
  }

  const sql = `
    SELECT id, name, calories_kcal, protein_g, fat_g, carbs_g
    FROM foods
    ${where}
    ORDER BY name ASC
    LIMIT ${lim} OFFSET ${off}
  `;

  // using query() avoids prepared-stmt edge cases entirely
  const [rows] = await pool.query(sql, params);
  return rows;
}
