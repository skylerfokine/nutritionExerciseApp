// Minimal guard for routes that need a logged-in session.
// Usage: router.post('/something', requireAuth, handler)

export function requireAuth(req, res, next) {
  // Let CORS preflights through so browsers can OPTIONS your endpoint.
  if (req.method === "OPTIONS") return next();

  // Sessions are set in app.js via express-session.
  // We expect register/login to set: req.session.userId, req.session.email
  const userId = req.session?.userId;
  if (!userId) {
    // 401 = not authenticated (no/invalid session cookie)
    return res.status(401).json({ error: "unauthorized" });
  }

  // Optional: expose a small, consistent auth payload to downstream handlers.
  // Avoid putting the whole session on req for clarity.
  req.auth = {
    userId,
    email: req.session.email ?? null,
  };

  return next();
}
