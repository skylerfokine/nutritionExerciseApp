-- 0.1 Staging for megaGymDataset.csv
CREATE TABLE IF NOT EXISTS staging_exercises_mega (
  row_id INT PRIMARY KEY AUTO_INCREMENT,
  csv_index INT NULL,
  Title VARCHAR(255),
  Desc TEXT,
  Type VARCHAR(100),
  BodyPart VARCHAR(100),
  Equipment VARCHAR(100),
  Level VARCHAR(50),
  Rating DECIMAL(4, 2) NULL,
  RatingDesc VARCHAR(255) NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 0.2 Staging for FOOD-DATA-GROUP1..5.csv  (load all 5 into this one table; add source_group 1..5)
CREATE TABLE IF NOT EXISTS staging_foods (
  row_id INT PRIMARY KEY AUTO_INCREMENT,
  source_group TINYINT NOT NULL,
  csv_index INT NULL,
  csv_index_2 INT NULL,
  food VARCHAR(255),
  Caloric Value DECIMAL(10, 3) NULL,
  Fat DECIMAL(10, 3) NULL,
  Saturated Fats DECIMAL(10, 3) NULL,
  Monounsaturated Fats DECIMAL(10, 3) NULL,
  Polyunsaturated Fats DECIMAL(10, 3) NULL,
  Carbohydrates DECIMAL(10, 3) NULL,
  Sugars DECIMAL(10, 3) NULL,
  Protein DECIMAL(10, 3) NULL,
  Dietary Fiber DECIMAL(10, 3) NULL,
  Cholesterol DECIMAL(10, 3) NULL,
  Sodium DECIMAL(10, 6) NULL,
  Water DECIMAL(10, 3) NULL,
  Vitamin A DECIMAL(10, 3) NULL,
  Vitamin B1 DECIMAL(10, 3) NULL,
  Vitamin B11 DECIMAL(10, 3) NULL,
  Vitamin B12 DECIMAL(10, 3) NULL,
  Vitamin B2 DECIMAL(10, 3) NULL,
  Vitamin B3 DECIMAL(10, 3) NULL,
  Vitamin B5 DECIMAL(10, 3) NULL,
  Vitamin B6 DECIMAL(10, 3) NULL,
  Vitamin C DECIMAL(10, 3) NULL,
  Vitamin D DECIMAL(10, 3) NULL,
  Vitamin E DECIMAL(10, 3) NULL,
  Vitamin K DECIMAL(10, 3) NULL,
  Calcium DECIMAL(10, 6) NULL,
  Copper DECIMAL(10, 3) NULL,
  Iron DECIMAL(10, 3) NULL,
  Magnesium DECIMAL(10, 3) NULL,
  Manganese DECIMAL(10, 3) NULL,
  Phosphorus DECIMAL(10, 3) NULL,
  Potassium DECIMAL(10, 3) NULL,
  Selenium DECIMAL(10, 3) NULL,
  Zinc DECIMAL(10, 3) NULL,
  Nutrition Density DECIMAL(10, 3) NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 0.3 Staging for gym_members_exercise_tracking.csv
CREATE TABLE IF NOT EXISTS staging_gym_public_sessions (
  row_id INT PRIMARY KEY AUTO_INCREMENT,
  Age INT,
  Gender VARCHAR(10),
  Weight (kg) DECIMAL(6, 2),
  Height (m) DECIMAL(4, 2),
  Max_BPM INT,
  Avg_BPM INT,
  Resting_BPM INT,
  Session_Duration (hours) DECIMAL(4, 2),
  Calories_Burned DECIMAL(8, 1),
  Workout_Type VARCHAR(50),
  Fat_Percentage DECIMAL(5, 2),
  Water_Intake (liters) DECIMAL(4, 2),
  Workout_Frequency (days / week) TINYINT,
  Experience_Level TINYINT,
  BMI DECIMAL(5, 2)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- THESE ARE THE START TO TABLES -- 
-- 1) App users (accounts)
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 2) Sessions (for express-session; explicit DDL = clarity & reproducibility)
CREATE TABLE IF NOT EXISTS sessions (
  session_id VARCHAR(128) NOT NULL,
  expires INT(11) UNSIGNED NOT NULL,
  data MEDIUMTEXT,
  PRIMARY KEY (session_id),
  KEY sessions_expires_idx (expires)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 3) Exercises master (cleaned from megaGymDataset)
CREATE TABLE IF NOT EXISTS exercises (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  type VARCHAR(100) NULL,
  level VARCHAR(50) NULL,
  rating DECIMAL(4, 2) NULL,
  rating_desc VARCHAR(255) NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_exercises_title ON exercises (title);

-- 4) Muscles dictionary (granular targets; you can seed from your BodyPart column)
CREATE TABLE IF NOT EXISTS muscles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 5) Junction: exercise ↔ muscles (many-to-many)
CREATE TABLE IF NOT EXISTS exercise_muscles (
  exercise_id INT NOT NULL,
  muscle_id INT NOT NULL,
  PRIMARY KEY (exercise_id, muscle_id),
  CONSTRAINT fk_em_exercise FOREIGN KEY (exercise_id) REFERENCES exercises (id) ON DELETE CASCADE,
  CONSTRAINT fk_em_muscle FOREIGN KEY (muscle_id) REFERENCES muscles (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 6) Equipment dictionary
CREATE TABLE IF NOT EXISTS equipment (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 7) Junction: exercise ↔ equipment (many-to-many)
CREATE TABLE IF NOT EXISTS exercise_equipment (
  exercise_id INT NOT NULL,
  equipment_id INT NOT NULL,
  PRIMARY KEY (exercise_id, equipment_id),
  CONSTRAINT fk_ee_exercise FOREIGN KEY (exercise_id) REFERENCES exercises (id) ON DELETE CASCADE,
  CONSTRAINT fk_ee_equipment FOREIGN KEY (equipment_id) REFERENCES equipment (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 8) Foods master (name + headline macros; raw numbers reflect dataset units)
CREATE TABLE IF NOT EXISTS foods (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  caloric_value DECIMAL(10, 3) NULL, -- "Caloric Value"
  fat_g DECIMAL(10, 3) NULL,
  carbs_g DECIMAL(10, 3) NULL,
  protein_g DECIMAL(10, 3) NULL,
  source_group TINYINT NULL, -- 1..5 from which CSV group
  UNIQUE KEY uq_foods_name (name)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_foods_name ON foods (name);

-- 9) Nutrient dictionary (so you can store all micros consistently)
CREATE TABLE IF NOT EXISTS nutrients (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE, -- e.g., "Vitamin A", "Calcium"
  unit VARCHAR(32) NULL -- e.g., "mg", "µg" (optional for now)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 10) Facts table: (food, nutrient, amount)
CREATE TABLE IF NOT EXISTS food_nutrients (
  food_id INT NOT NULL,
  nutrient_id INT NOT NULL,
  amount DECIMAL(14, 6) NOT NULL,
  PRIMARY KEY (food_id, nutrient_id),
  CONSTRAINT fk_fn_food FOREIGN KEY (food_id) REFERENCES foods (id) ON DELETE CASCADE,
  CONSTRAINT fk_fn_nutrient FOREIGN KEY (nutrient_id) REFERENCES nutrients (id) ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 11) User food logs (store computed macros at insert time for easy analytics)
CREATE TABLE IF NOT EXISTS user_food_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  food_id INT NOT NULL,
  log_date DATE NOT NULL,
  quantity DECIMAL(10, 3) NOT NULL, -- document unit choice (e.g., dataset serving or grams)
  calories_kcal DECIMAL(10, 3) NOT NULL,
  protein_g DECIMAL(10, 3) NOT NULL,
  fat_g DECIMAL(10, 3) NOT NULL,
  carbs_g DECIMAL(10, 3) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ufl_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_ufl_food FOREIGN KEY (food_id) REFERENCES foods (id) ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_ufl_user_date ON user_food_logs (user_id, log_date);

-- 12) User exercise logs
CREATE TABLE IF NOT EXISTS user_exercise_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  exercise_id INT NOT NULL,
  log_date DATE NOT NULL,
  duration_min DECIMAL(6, 2) NULL,
  sets INT NULL,
  reps INT NULL,
  weight_kg DECIMAL(6, 2) NULL,
  notes VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_uel_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_uel_exercise FOREIGN KEY (exercise_id) REFERENCES exercises (id) ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_uel_user_date ON user_exercise_logs (user_id, log_date);

-- 13) User goals (macros &/or streaks)
CREATE TABLE IF NOT EXISTS user_goals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  goal_type ENUM ('calorie', 'macro_split', 'streak') NOT NULL,
  target_kcal INT NULL,
  target_protein_g INT NULL,
  target_fat_g INT NULL,
  target_carbs_g INT NULL,
  start_date DATE NOT NULL,
  end_date DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ugo_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 14) Public session records (not app users; used for example leaderboards/analytics)
CREATE TABLE IF NOT EXISTS gym_public_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  age INT,
  gender VARCHAR(10),
  weight_kg DECIMAL(6, 2),
  height_m DECIMAL(4, 2),
  max_bpm INT,
  avg_bpm INT,
  resting_bpm INT,
  session_duration_hours DECIMAL(4, 2),
  calories_burned DECIMAL(8, 1),
  workout_type VARCHAR(50),
  fat_percentage DECIMAL(5, 2),
  water_intake_liters DECIMAL(4, 2),
  workout_frequency_days_per_week TINYINT,
  experience_level TINYINT,
  bmi DECIMAL(5, 2)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_gps_type ON gym_public_sessions (workout_type);

-- 15) User profiles (optional extended info separate from auth)
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id INT PRIMARY KEY,
  first_name VARCHAR(100) NULL,
  last_name VARCHAR(100) NULL,
  avatar_url VARCHAR(500) NULL,
  bio VARCHAR(500) NULL,
  timezone VARCHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_up_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 16) Gyms (dictionary of real/fictional gyms; handy for mock leaderboards)
CREATE TABLE IF NOT EXISTS gyms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE,
  city VARCHAR(120) NULL,
  state VARCHAR(120) NULL,
  country VARCHAR(120) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 17) User ↔ Gym memberships (many-to-many junction)
CREATE TABLE IF NOT EXISTS user_gym_memberships (
  user_id INT NOT NULL,
  gym_id INT NOT NULL,
  member_since DATE NOT NULL DEFAULT (CURRENT_DATE),
  membership_type ENUM ('basic', 'plus', 'pro') DEFAULT 'basic',
  PRIMARY KEY (user_id, gym_id),
  CONSTRAINT fk_ugm_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_ugm_gym FOREIGN KEY (gym_id) REFERENCES gyms (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 18) Badges (dictionary)
CREATE TABLE IF NOT EXISTS badges (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(100) NOT NULL UNIQUE, -- e.g., "STREAK_7"
  name VARCHAR(255) NOT NULL, -- e.g., "7-Day Streak"
  description VARCHAR(500) NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 19) User badges (awards earned by users)
CREATE TABLE IF NOT EXISTS user_badges (
  user_id INT NOT NULL,
  badge_id INT NOT NULL,
  awarded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, badge_id),
  CONSTRAINT fk_ub_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_ub_badge FOREIGN KEY (badge_id) REFERENCES badges (id) ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 20) Audit log (optional: track important actions for demos/debug)
CREATE TABLE IF NOT EXISTS audit_log (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NULL,
  action VARCHAR(100) NOT NULL, -- e.g., "REGISTER", "LOGIN", "LOG_FOOD"
  entity_type VARCHAR(100) NULL, -- e.g., "user_food_logs"
  entity_id VARCHAR(64) NULL, -- store as text to avoid FK coupling
  details JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_user_time (user_id, created_at),
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
