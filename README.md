# FitTrack — Nutrition & Exercise Web App

## Project Goal
Help users **log workouts and meals**, then visualize **weekly macros** and **leaderboards** (consistency & popular exercises) using a modern web stack:
- **Frontend:** React (Vite)
- **Backend:** Node.js + Express (session auth)
- **Database:** MySQL
- **Datasets:** 3 public datasets imported locally

## What interactions does the app provide?
- Create an account / Login (session-based authentication)
- Search & log **exercises** (then inline-edit sets/reps/weight/duration)
- Search & log **foods** (auto-calculates kcal/protein/fat/carbs)
- View a **weekly macro** summary
- Browse **Leaderboards**:
  - Most consistent users (active days within a time window)
  - Most popular exercises (usage count)

> 🎥 A short demo video is submitted **with the Canvas submission**.

---

## ER Diagram
The ER diagram is included at:
erdiagram.png




## Repository Layout


/client # React (Vite)
/server # Node + Express + MySQL
/db # SQL schema, staging, and seed scripts
/docs # ER diagram, notes, screenshots




**Current (9):**
1. `users`
2. `sessions` (express-mysql-session)
3. `exercises`
4. `foods`
5. `user_exercise_logs`
6. `user_food_logs`
7. `exercises_stage`
8. `foods_stage`
9. `gym_members_stage`
10. `body_parts`
11. `muscles`
12. `exercise_muscles` (exercise ↔ muscle)
13. `equipment`
14. `exercise_equipment` (exercise ↔ equipment)
15. `difficulty_levels` (+ optional FK on `exercises.difficulty_id`)
16. `food_categories`
17. `food_category_map` (food ↔ category)
18. `meal_types` (+ optional FK on `user_food_logs.meal_type_id`)
19. `user_goals` (historical macro targets per user)
20. `user_settings` (units, timezone, etc.)

The extra 11 tables are **schema-only** and can be populated later; they do not break existing app code.



## Setup & Run

### 1) Prerequisites
- Node.js 18+ and npm
- MySQL 8+ (local)
- (Optional) MySQL Workbench

### 2) Create database and user
In MySQL (as root/admin):
```sql
CREATE DATABASE IF NOT EXISTS fitness_app_dev
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

CREATE USER IF NOT EXISTS 'dev_user'@'localhost' IDENTIFIED BY 'YOUR_PASS';
GRANT ALL PRIVILEGES ON fitness_app_dev.* TO 'dev_user'@'localhost';
FLUSH PRIVILEGES;

``````
## 3) Quick-start: database import (pick Workbench **or** CLI)

### Option A — MySQL Workbench (GUI)
1. **Server → Data Import**
2. **Import from Self-Contained File** → select `Dump20251211.sql`.
3. Keep **Dump Structure and Data**.
4. Click **Start Import**.
5. Open a new SQL tab to verify


### Option B (cli)

#### Use a user with CREATE privileges (root or your configured dev user)

mysql -u root -p < Dump20251211.sql

#### or

mysql -u dev_user -p < Dump20251211.sql

# Create a .env in server directory:

example one

NODE_ENV=development
PORT=3001
CLIENT_ORIGIN=http://localhost:5173

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=dev_user
DB_PASSWORD=YOUR_PASS
DB_NAME=fitness_app_dev

SESSION_NAME=app_session
SESSION_SECRET=replace_me_with_a_long_random_string
SESSION_TTL_HOURS=24



# Create a .env in client: 


VITE_API_URL=http://localhost:3001


# How to install dependices and run the program: 

## backend
cd server
npm install
npm run dev

## frontend (new terminal)
cd ../client
npm install
npm run dev 


# Our 3 Datasets: 
## Exercises (“MegaGym Dataset”) — Public exercise dataset with body part, target muscles, equipment, and instructions.

    https://www.kaggle.com/datasets/niharika41298/gym-exercise-data <br>

## Gym members exercise tracking — Public sample log dataset; used to seed synthetic user accounts for demo leaderboards.

    https://www.kaggle.com/datasets/valakhorasani/gym-members-exercise-dataset <br>

## Foods (FOOD-DATA-GROUP1..5.csv) — Consolidated nutrition dataset (kcal, protein, fat, carbs).  Public/open nutrition dataset. (Add exact URL/provider and access date.)

    https://www.kaggle.com/datasets/utsavdey1410/food-nutrition-dataset


# NOTES FOR TA's

-  App uses session-based auth with a MySQL session store (sessions table).

- All endpoints return JSON; the server has a JSON error handler (no HTML error pages).

- Leaderboards compute over the last N days (7/30/90) and can be viewed without auth for easy demo.






