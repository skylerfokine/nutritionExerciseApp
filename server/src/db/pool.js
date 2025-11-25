//file to manage our db connections through pooling
//if you're my teammates you can read this : en.wikipedia.org/wiki/Connection_pool

import mysql from "mysql2/promise";
import { config } from "../config/env.js";

//Db configuration using you .env file.
export const pool = await mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.pass,
  database: config.db.name,
  connectionLimit: config.db.connLimit,
  timezone: config.db.timezone,
  charset: config.db.charset,
});

//Prove Connectivity by using a querry:
await pool.query("SELECT 1");
