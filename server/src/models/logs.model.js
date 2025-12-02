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

export async function leaderboardConsistency({ days = 30, limit = 10 }) {
  const sql = `
    SELECT u.id, u.display_name,
           COUNT(DISTINCT l.log_date) AS active_days
    FROM users u
    JOIN user_exercise_logs l ON l.user_id = u.id
    WHERE l.log_date >= CURDATE() - INTERVAL ? DAY
    GROUP BY u.id, u.display_name
    ORDER BY active_days DESC, u.display_name ASC
    LIMIT ?
  `;
  const [rows] = await pool.execute(sql, [days, limit]);
  return rows;
}

export async function leaderboardPopularExercises({ days = 30, limit = 10 }) {
  const sql = `
    SELECT e.id, e.title,
           COUNT(*) AS times_logged
    FROM user_exercise_logs l
    JOIN exercises e ON e.id = l.exercise_id
    WHERE l.log_date >= CURDATE() - INTERVAL ? DAY
    GROUP BY e.id, e.title
    ORDER BY times_logged DESC, e.title ASC
    LIMIT ?
  `;
  const [rows] = await pool.execute(sql, [days, limit]);
  return rows;
}
