-- Create (or switch to) your dev schema
CREATE DATABASE IF NOT EXISTS fitness_app_dev CHARACTER
SET
  utf8mb4 COLLATE utf8mb4_unicode_520_ci;

USE fitness_app_dev;

-- ============ USERS ============
CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- ============ EXERCISES (from your downloaded dataset) ============
-- Keep this "catalog" relatively normalized. Add columns your dataset actually has.
CREATE TABLE IF NOT EXISTS exercises (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  body_part VARCHAR(100) DEFAULT NULL,
  equipment VARCHAR(100) DEFAULT NULL,
  description TEXT NULL,
  source_name VARCHAR(50) DEFAULT 'local', -- identify dataset file if helpful
  source_uid VARCHAR(100) DEFAULT NULL, -- original ID in the dataset, if present
  PRIMARY KEY (id),
  KEY idx_exercises_body_part (body_part),
  KEY idx_exercises_equipment (equipment),
  UNIQUE KEY uq_exercises_source (source_name, source_uid) -- prevents duplicate imports if you have an ID
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- ============ FOODS (from your downloaded dataset) ============
-- Store macros per 100g so logging can compute totals by simple multiplication.
CREATE TABLE IF NOT EXISTS foods (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  description VARCHAR(255) NOT NULL,
  brand VARCHAR(120) DEFAULT NULL,
  source_name VARCHAR(50) DEFAULT 'local',
  source_uid VARCHAR(100) DEFAULT NULL,
  calories_kcal_100g DECIMAL(8, 2) NOT NULL DEFAULT 0,
  protein_g_100g DECIMAL(8, 2) NOT NULL DEFAULT 0,
  fat_g_100g DECIMAL(8, 2) NOT NULL DEFAULT 0,
  carbs_g_100g DECIMAL(8, 2) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_foods_desc (description),
  UNIQUE KEY uq_foods_source (source_name, source_uid)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- ============ USER FOOD LOGS (computed macros stored at write time) ============
CREATE TABLE IF NOT EXISTS user_food_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  food_id BIGINT UNSIGNED NOT NULL,
  log_date DATE NOT NULL, -- store the day; use DATETIME if you need timestamps
  quantity_g DECIMAL(10, 2) NOT NULL, -- grams (or store servings; pick one policy and stick to it)
  calories_kcal DECIMAL(10, 2) NOT NULL, -- computed at insert time
  protein_g DECIMAL(10, 2) NOT NULL,
  fat_g DECIMAL(10, 2) NOT NULL,
  carbs_g DECIMAL(10, 2) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_ufl_user_date (user_id, log_date),
  KEY idx_ufl_food (food_id),
  CONSTRAINT fk_ufl_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_ufl_food FOREIGN KEY (food_id) REFERENCES foods (id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- ============ USER EXERCISE LOGS ============
CREATE TABLE IF NOT EXISTS user_exercise_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  exercise_id BIGINT UNSIGNED NOT NULL,
  log_date DATE NOT NULL,
  duration_min DECIMAL(8, 2) DEFAULT NULL,
  sets INT UNSIGNED DEFAULT NULL,
  reps INT UNSIGNED DEFAULT NULL,
  weight_kg DECIMAL(8, 2) DEFAULT NULL,
  notes VARCHAR(500) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_uel_user_date (user_id, log_date),
  KEY idx_uel_exercise (exercise_id),
  CONSTRAINT fk_uel_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_uel_exercise FOREIGN KEY (exercise_id) REFERENCES exercises (id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- ============ MEMBERS (3rd public dataset for leaderboards) ============
-- Shape this to your CSV; here’s a safe minimal scaffold you can extend.
CREATE TABLE IF NOT EXISTS members (
  member_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(120) NOT NULL,
  join_date DATE DEFAULT NULL,
  status VARCHAR(50) DEFAULT NULL, -- e.g., 'active', 'inactive'
  source_name VARCHAR(50) DEFAULT 'local',
  PRIMARY KEY (member_id),
  KEY idx_members_status (status),
  KEY idx_members_join_date (join_date)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- Optional (if your members dataset has daily attendance you want to use):
-- CREATE TABLE IF NOT EXISTS member_activity (
--   member_id   BIGINT UNSIGNED NOT NULL,
--   activity_date DATE NOT NULL,
--   did_activity  TINYINT(1) NOT NULL DEFAULT 1,
--   PRIMARY KEY (member_id, activity_date),
--   CONSTRAINT fk_member_activity_member
--     FOREIGN KEY (member_id) REFERENCES members(member_id)
--     ON DELETE CASCADE ON UPDATE CASCADE
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
