# nutritionExerciseApp
Class project app that you can use to keep track of caloric intake and track workouts


## Exercise and Nutrition app
- Exercise database (data base full of different type of exercises)
- Food Database 
- Gym member population data

## Write REQ
	Create an account 
	Enter Exercise 
	Enter food
### 3 analytical views 
	Macro diet view 
	Leaderboard for most consistent
	Leaderboard for most popular exercises

## React app
https://www.bezkoder.com/react-node-express-mysql/#google_vignette <br>
https://www.kaggle.com/datasets/valakhorasani/gym-members-exercise-dataset <br>
https://www.kaggle.com/datasets/niharika41298/gym-exercise-data <br>
https://www.kaggle.com/datasets/utsavdey1410/food-nutrition-dataset



## Our NPM libs:
- express: server framework
-  cors: allow react dev login
- doenv: load .env 
- helmet: secure http headers
- morgan : request logging in dev
- mysql2 : Mysql driver
- express-session: session middleware
- express-mysql-session: persists sessions in Mysql
- zod: input validation (for auth forms)
- bcrypt: password hashing 



#Explaining File Structure 

- Config/
    Read and Validate Configuration. Fail Fast if something is missing (e.g. DB_PASS) and the rest of the code imports a configured object 
    (environment & secrets single source of truth.)

- db/
    Infrastructure for persistence. Single Mysql pool in *pool.js* and Sessions persistence in *sessionStore.js* makes it so MYSQL logins survive server restarts

- Routes/ 
    URL contracts (Frontend and Backend Communication) + HTTP verbs (Your HTTP calls)
    This directory makes it easier to scan APIS and add middleware routes if needed. 

- Controllers/ 
    HTTP layer (validate input, call models, manage sessions, pick status codes).

- Models/ 
    SQL layer (ohnly DB work, parameterized queries, Transactions)
