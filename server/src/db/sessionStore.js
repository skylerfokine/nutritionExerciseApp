// src/db/sessionStore.js
import session from "express-session";
import MySQLStoreFactory from "express-mysql-session";
import mysql from "mysql2"; // <-- NOTE: not 'mysql2/promise'
import { config } from "../config/env.js";

const MySQLStore = MySQLStoreFactory(session);

// Build a classic (callback) pool for the session store
const connection = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.pass,
  database: config.db.name,
  charset: config.db.charset,
});

// Give that pool to the store
export const sessionStore = new MySQLStore(
  {
    createDatabaseTable: true,
    clearExpired: true,
    checkExpirationInterval: 1000 * 60 * 10,
  },
  connection,
);
