import { pool } from "../db/pool.js";

// create a user (later used in /auth/register)
export async function createUser({ email, displayName, passwordHash }) {
  const sql = `
    INSERT INTO users (email, display_name, password_hash)
    VALUES (?, ?, ?)
  `;
  const [result] = await pool.execute(sql, [email, displayName, passwordHash]);
  return { id: result.insertId, email, display_name: displayName };
}

// used by /auth/login to retrieve the hash
export async function findUserByEmail(email) {
  const sql = `SELECT id, email, display_name, password_hash FROM users WHERE email = ? LIMIT 1`;
  const [rows] = await pool.execute(sql, [email]);
  return rows[0] || null;
}

// nice to have
export async function findUserById(id) {
  const sql = `SELECT id, email, display_name FROM users WHERE id = ?`;
  const [rows] = await pool.execute(sql, [id]);
  return rows[0] || null;
}

export async function updateLastLogin(userId) {
  const sql = `UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?`;
  await pool.execute(sql, [userId]);
}
