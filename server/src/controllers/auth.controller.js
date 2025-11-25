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
