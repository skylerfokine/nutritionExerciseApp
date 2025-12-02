import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  macroDietView,
  mostConsistent,
  mostPopularExercises,
} from "../controllers/analytics.controller.js";

export const analyticsRouter = Router();
analyticsRouter.get("/macros", requireAuth, macroDietView); // per-user: auth
analyticsRouter.get("/leaderboards/consistent", mostConsistent); // demo: public (optional)
analyticsRouter.get("/leaderboards/popular-exercises", mostPopularExercises);
