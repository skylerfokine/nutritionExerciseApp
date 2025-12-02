import bcrypt from "bcrypt";
import { z } from "zod";
import {
  createUser,
  findUserByEmail,
  updateLastLogin,
} from "../models/users.model.js";

export const debugLogin = (req, res) => {
  req.session.userId = 123; // pretend user #123
  req.session.email = "test@example.com";
  res.json({ message: "session set", userId: req.session.userId });
};

export const me = (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "unauthorized" });
  res.json({ userId: req.session.userId, email: req.session.email });
};

export const logout = (req, res) => {
  const isProd = process.env.NODE_ENV === "production";
  const cookieName = process.env.SESSION_COOKIE_NAME || "app_session";

  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: "logout_failed" });
    res.clearCookie(cookieName, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
    });
    res.json({ message: "logged_out" });
  });
};

/**
 * Zod schemas validate incoming JSON so we never trust client data.
 * We can tweak min lengths if needed.
 */
const registerSchema = z.object({
  email: z.string().email().max(255),
  displayName: z.string().min(2).max(100),
  password: z.string().min(8).max(200),
});

const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(200),
});

/**
 * POST /auth/register
 * - validates input
 * - checks for existing email
 * - hashes password
 * - inserts user
 * - sets session
 */
export const register = async (req, res) => {
  // 1) Validate body
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "invalid_body", details: parsed.error.issues });
  }

  // 2) Normalize
  const email = parsed.data.email.trim().toLowerCase();
  const displayName = parsed.data.displayName.trim();
  const password = parsed.data.password;

  try {
    // 3) Enforce uniqueness at app layer (DB also enforces UNIQUE)
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: "email_taken" });
    }

    // 4) Hash password (12 cost is a good default)
    const passwordHash = await bcrypt.hash(password, 12);

    // 5) Insert user (model returns id + public fields)
    const user = await createUser({ email, displayName, passwordHash });

    // 6) Set session (server-side) and send cookie
    req.session.userId = user.id;
    req.session.email = user.email;

    // 7) Respond with public fields (never send password/hash)
    return res.status(201).json({
      id: user.id,
      email: user.email,
      displayName: user.display_name, // the model returns snake_case field name
    });
  } catch (err) {
    // If DB unique index threw before we checked existing:
    // MySQL ER_DUP_ENTRY code is 1062
    if (err && err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "email_taken" });
    }
    console.error("Register error:", err);
    return res.status(500).json({ error: "server_error" });
  }
};

/**
 * POST /auth/login
 * - validates input
 * - fetches user by email
 * - compares bcrypt hash
 * - updates last_login_at (optional)
 * - sets session
 */
export const login = async (req, res) => {
  // 1) Validate body
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "invalid_body", details: parsed.error.issues });
  }

  // 2) Normalize
  const email = parsed.data.email.trim().toLowerCase();
  const password = parsed.data.password;

  try {
    // 3) Get user (includes password_hash)
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "invalid_credentials" });
    }

    // 4) Compare password vs. hash
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "invalid_credentials" });
    }

    // 5) Optional: mark last login
    await updateLastLogin(user.id);

    // 6) Set session + respond
    req.session.userId = user.id;
    req.session.email = user.email;

    return res.json({
      id: user.id,
      email: user.email,
      displayName: user.display_name,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "server_error" });
  }
};
