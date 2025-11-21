/**
 * Express server for our Nutrition & Exercise app.
 *
 * What this file sets up (in order):
 *  1) MySQL connection pool  -> proves DB connectivity at startup
 *  2) Session store (MySQL)  -> cookie-based server sessions (login persistence)
 *  3) Security & CORS        -> helmet + CORS with credentials for cookies
 *  4) Minimal routes         -> /health + debug auth routes to prove the loop
 *  5) Error handling & listen
 *
 */

import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import session from "express-session";
import MySQLStoreFactory from "express-mysql-session";
import mysql from "mysql2/promise";
import { config } from "./config.js";

async function main() {
  // ---------------------------------------
  // 1) Create a MySQL connection pool
  // - Pool is faster than opening a new connection per request.
  // - We run 'SELECT 1' to fail early if credentials are wrong.
  // ---------------------------------------
  const pool = await mysql.createPool({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.pass,
    database: config.db.name,
    connectionLimit: config.db.connLimit,
    timezone: config.db.timezone, // store times as UTC
    charset: config.db.charset,
  });
  await pool.query("SELECT 1"); // crash on boot if DB is unreachable (good!)

  // ---------------------------------------
  // 2) Set up a persistent session store in MySQL
  // - Server sessions are stored server-side (in DB), not in the browser.
  // - The cookie only holds a signed session ID, not the user data.
  // - express-mysql-session can auto-create its 'sessions' table.
  // ---------------------------------------
  const MySQLStore = MySQLStoreFactory(session);
  const sessionStore = new MySQLStore(
    {
      createDatabaseTable: true, // creates 'sessions' table if missing
      clearExpired: true, // cleanup expired sessions
      checkExpirationInterval: 1000 * 60 * 10, // every 10 minutes
      // You can also customize the table/column names via 'schema' here.
    },
    // Under-the-hood connection
    {
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.pass,
      database: config.db.name,
      charset: config.db.charset,
    },
  );

  // ---------------------------------------
  // 3) Create the Express app and middleware stack
  // ---------------------------------------
  const app = express();

  // Security headers (CSP, X-Frame-Options, etc.). Tweak CSP later if we add CDNs.
  app.use(helmet());

  // CORS: allows React dev origin and tell the browser it can send cookies.
  app.use(
    cors({
      origin: config.clientOrigin, // e.g., http://localhost:5173
      credentials: true, // <-- REQUIRED for cookie-based auth in browsers
    }),
  );

  // Dev logs for debugging (method, path, status).
  if (config.nodeEnv !== "production") {
    app.use(morgan("dev"));
  }

  // JSON body parser (so POST/PUT/PATCH with JSON bodies work)
  app.use(express.json());

  // Session middleware (must come before routes that use req.session)
  const isProd = config.nodeEnv === "production";
  const ttlMs = config.session.ttlHours * 60 * 60 * 1000;

  app.use(
    session({
      name: config.session.name, // cookie name (e.g., 'app_session')
      secret: config.session.secret, // signs session ID cookie
      store: sessionStore, // persist sessions in MySQL
      resave: false, // don't resave if nothing changed
      saveUninitialized: false, // don't create empty sessions
      rolling: true, // refresh cookie expiry on activity
      cookie: {
        httpOnly: true, // JS can't read cookie (mitigates XSS)
        sameSite: "lax", // CSRF protection for normal navigations
        secure: isProd, // HTTPS-only in production
        maxAge: ttlMs, // how long the browser keeps the cookie
      },
    }),
  );

  // ---------------------------------------
  // 4) Routes
  // ---------------------------------------

  // Health check: lets you (and CI) know the API is alive + which env it’s in
  app.get("/health", (req, res) => {
    res.json({ ok: true, env: config.nodeEnv });
  });

  // ---- TEMPORARY DEBUG AUTH ENDPOINTS ----
  // These let you prove that sessions + cookies + CORS are wired correctly.
  // Replace with real /auth/register and /auth/login in the next part.

  // Pretend login: just set a userId in the session
  app.post("/auth/debug-login", (req, res) => {
    req.session.userId = 123; // pretend we authenticated user #123
    req.session.email = "test@example.com"; // minimal identity for the demo
    res.json({ message: "session set", userId: req.session.userId });
  });

  // Who am I? Requires a valid session cookie
  app.get("/auth/me", (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "unauthorized" });
    }
    res.json({ userId: req.session.userId, email: req.session.email });
  });

  // Logout: destroys the server session AND tells the browser to clear the cookie
  app.post("/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ error: "logout_failed" });
      res.clearCookie(config.session.name, {
        httpOnly: true,
        sameSite: "lax",
        secure: isProd,
      });
      res.json({ message: "logged_out" });
    });
  });

  // Fallback 404
  app.use((req, res) => res.status(404).json({ error: "not_found" }));

  // ---------------------------------------
  // 5) Start the HTTP server
  // ---------------------------------------
  app.listen(config.port, () => {
    console.log(`API listening on http://localhost:${config.port}`);
  });
}

// Top-level boot: crash loudly if something fails so issues are obvious.
main().catch((e) => {
  console.error("Fatal server error:", e);
  process.exit(1);
});
