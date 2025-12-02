import { z } from "zod";
import {
  getDailyMacros,
  leaderboardConsistency,
  leaderboardPopularExercises,
} from "../models/logs.model.js";

const rangeSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// Requires auth because it’s “my macros”.
export const macroDietView = async (req, res) => {
  if (!req.session?.userId)
    return res.status(401).json({ error: "unauthorized" });

  const q = rangeSchema.safeParse(req.query);
  if (!q.success)
    return res
      .status(400)
      .json({ error: "invalid_query", details: q.error.issues });

  const rows = await getDailyMacros({
    userId: req.session.userId,
    from: q.data.from,
    to: q.data.to,
  });
  return res.json({ userId: req.session.userId, range: q.data, days: rows });
};

// These can be public (class demo), or protect with requireAuth—your call.
export const mostConsistent = async (req, res) => {
  const days = Number(req.query.days ?? 30);
  const limit = Number(req.query.limit ?? 10);
  const rows = await leaderboardConsistency({ days, limit });
  return res.json({ days, limit, leaderboard: rows });
};

export const mostPopularExercises = async (req, res) => {
  const days = Number(req.query.days ?? 30);
  const limit = Number(req.query.limit ?? 10);
  const rows = await leaderboardPopularExercises({ days, limit });
  return res.json({ days, limit, leaderboard: rows });
};
