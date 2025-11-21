/**
 * Centralized configuration loader.
 * - Reads environment variables (via dotenv) in one place.
 * - Throws helpful errors if a required variable is missing.
 * - Keeps index.js focused on the app, not on parsing.
 */

import "dotenv/config"; // Loads .env into process.env at import-time

// Helper: read a required env var or throw early with a clear error message.
const required = (name) => {
  const v = process.env[name];
  if (!v)
    throw new Error(
      `Missing env var ${name} (check /server/.env or .env.example)`,
    );
  return v;
};

export const config = {
  // General
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT ?? "3001", 10),

  // CORS: which browser origin is allowed to send cookies to this API
  clientOrigin: required("CLIENT_ORIGIN"),

  // MySQL connection settings
  db: {
    host: required("DB_HOST"),
    port: parseInt(process.env.DB_PORT ?? "3306", 10),
    name: required("DB_NAME"),
    user: required("DB_USER"),
    pass: required("DB_PASS"),
    connLimit: parseInt(process.env.DB_CONN_LIMIT ?? "10", 10),
    timezone: process.env.DB_TIMEZONE || "Z",
    charset: process.env.DB_CHARSET || "utf8mb4",
  },

  // Session/cookie settings
  session: {
    name: process.env.SESSION_COOKIE_NAME || "app_session",
    secret: required("SESSION_SECRET"), // used to sign session cookie
    ttlHours: parseInt(process.env.SESSION_TTL_HOURS ?? "24", 10), // session duration
  },
};
