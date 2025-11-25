import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import session from "express-session";

import { config } from "./config/env.js";
import { sessionStore } from "./db/sessionStore.js";
import "./db/pool.js"; // side-effect: verifies DB on boot

import { authRouter } from "./routes/auth.routes.js";

export function buildApp() {
  const app = express();
  const isProd = config.nodeEnv === "production";
  const ttlMs = config.session.ttlHours * 60 * 60 * 1000;

  //security headers
  app.use(helmet());

  // Cors: allow our react origin and allow us to use cookies

  app.use(
    cors({
      origin: config.clientOrigin,
      credentials: true,
    }),
  );

  //Dev logs in non prod envs
  if (!isProd) app.use(morgan("dev"));

  //Parse Json bodies
  app.use(express.json());

  app.use(
    session({
      name: config.session.name,
      secret: config.session.secret,
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      rolling: true,
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: isProd,
        maxAge: ttlMs,
      },
    }),
  );

  // health route for smoke tests
  app.get("/health", (req, res) => res.json({ ok: true, env: config.nodeEnv }));

  // feature routes
  app.use("/auth", authRouter);

  // 404 fallback
  app.use((_, res) => res.status(404).json({ error: "not_found" }));

  return app;
}
