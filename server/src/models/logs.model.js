// Data-access only: insert logs and run analytics queries.
import { pool } from "../db/pool.js";

export async function createFoodLog({
  userId,
  foodId,
  quantity,
  logDate,
  calories_kcal,
  protein_g,
  fat_g,
  carbs_g,
}) {
  const sql = `
    INSERT INTO user_food_logs
      (user_id, food_id, quantity, log_date,
       calories_kcal, protein_g, fat_g, carbs_g)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    userId,
    foodId,
    quantity,
    logDate,
    calories_kcal,
    protein_g,
    fat_g,
    carbs_g,
  ];
  const [result] = await pool.execute(sql, params);
  return { id: result.insertId };
}

export async function createExerciseLog({
  userId,
  exerciseId,
  logDate,
  sets,
  reps,
  weight_kg,
  duration_min,
}) {
  const sql = `
    INSERT INTO user_exercise_logs
      (user_id, exercise_id, log_date, sets, reps, weight_kg, duration_min)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    userId,
    exerciseId,
    logDate,
    sets ?? null,
    reps ?? null,
    weight_kg ?? null,
    duration_min ?? null,
  ];
  const [result] = await pool.execute(sql, params);
  return { id: result.insertId };
}

export async function getDailyMacros({ userId, from, to }) {
  const sql = `
    SELECT log_date,
           ROUND(SUM(calories_kcal), 2) AS calories_kcal,
           ROUND(SUM(protein_g),   2) AS protein_g,
           ROUND(SUM(fat_g),       2) AS fat_g,
           ROUND(SUM(carbs_g),     2) AS carbs_g
    FROM user_food_logs
    WHERE user_id = ? AND log_date BETWEEN ? AND ?
    GROUP BY log_date
    ORDER BY log_date
  `;
  const [rows] = await pool.execute(sql, [userId, from, to]);
  return rows;
}

// format JS Date -> 'YYYY-MM-DD'
function ymd(d) {
  return d.toISOString().slice(0, 10);
}

// clamp helper for LIMIT to avoid injection and bad values
function clampLimit(x, def = 10, min = 1, max = 100) {
  const n = Number(x);
  if (!Number.isFinite(n)) return def;
  return Math.min(Math.max(Math.trunc(n), min), max);
}

/** Leaderboard: most consistent users (distinct active days since cutoff). */
export async function leaderboardConsistency({ days = 30, limit = 10 }) {
  // compute cutoff date in JS (no INTERVAL placeholder in SQL)
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - Number(days || 30));
  const cutoffStr = ymd(cutoff);

  // inline LIMIT as a literal after clamping to prevent prepared-stmt error
  const lim = clampLimit(limit);

  const sql = `
    SELECT u.id, u.display_name,
           COUNT(DISTINCT l.log_date) AS active_days
    FROM users u
    JOIN user_exercise_logs l ON l.user_id = u.id
    WHERE l.log_date >= ?
    GROUP BY u.id, u.display_name
    ORDER BY active_days DESC, u.display_name ASC
    LIMIT ${lim}
  `;
  const [rows] = await pool.execute(sql, [cutoffStr]);
  return rows;
}

/** Leaderboard: most popular exercises (count of logs since cutoff). */
export async function leaderboardPopularExercises({ days = 30, limit = 10 }) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - Number(days || 30));
  const cutoffStr = ymd(cutoff);

  const lim = clampLimit(limit);

  const sql = `
    SELECT e.id, e.title,
           COUNT(*) AS times_logged
    FROM user_exercise_logs l
    JOIN exercises e ON e.id = l.exercise_id
    WHERE l.log_date >= ?
    GROUP BY e.id, e.title
    ORDER BY times_logged DESC, e.title ASC
    LIMIT ${lim}
  `;
  const [rows] = await pool.execute(sql, [cutoffStr]);
  return rows;
}

// List a user's food logs in a date range
export async function listFoodLogs({
  userId,
  from,
  to,
  limit = 100,
  offset = 0,
}) {
  const lim = Math.min(Math.max(Number(limit) || 100, 1), 500);
  const off = Math.max(Number(offset) || 0, 0);

  const sql = `
    SELECT id, food_id, quantity, log_date,
           calories_kcal, protein_g, fat_g, carbs_g, created_at
    FROM user_food_logs
    WHERE user_id = ? AND log_date BETWEEN ? AND ?
    ORDER BY log_date DESC, id DESC
    LIMIT ${lim} OFFSET ${off}
  `;
  // Only userId/from/to are bound; LIMIT/OFFSET are validated & inlined
  const [rows] = await pool.query(sql, [userId, from, to]);
  return rows;
}

// List a user's exercise logs in a date range
export async function listExerciseLogs({
  userId,
  from,
  to,
  limit = 100,
  offset = 0,
}) {
  const lim = Math.min(Math.max(Number(limit) || 100, 1), 500);
  const off = Math.max(Number(offset) || 0, 0);

  const sql = `
    SELECT id, exercise_id, log_date, sets, reps, weight_kg, duration_min, created_at
    FROM user_exercise_logs
    WHERE user_id = ? AND log_date BETWEEN ? AND ?
    ORDER BY log_date DESC, id DESC
    LIMIT ${lim} OFFSET ${off}
  `;
  const [rows] = await pool.query(sql, [userId, from, to]);
  return rows;
}

// delete helpers
export async function deleteFoodLog({ id, userId }) {
  const sql = `DELETE FROM user_food_logs WHERE id = ? AND user_id = ?`;
  const [res] = await pool.execute(sql, [id, userId]);
  return res.affectedRows > 0;
}
export async function deleteExerciseLog({ id, userId }) {
  const sql = `DELETE FROM user_exercise_logs WHERE id = ? AND user_id = ?`;
  const [res] = await pool.execute(sql, [id, userId]);
  return res.affectedRows > 0;
}
