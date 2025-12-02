import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  addExerciseLog,
  listExercises,
  listMyExerciseLogs,
  removeExerciseLog,
} from "../controllers/exercises.controller.js";

export const exercisesRouter = Router();

// browse/search exercises (public)
exercisesRouter.get("/", listExercises);

// my exercise logs (auth)
exercisesRouter.get("/logs", requireAuth, listMyExerciseLogs);

// add log (auth)
exercisesRouter.post("/logs", requireAuth, addExerciseLog);

// delete log (auth, optional)
exercisesRouter.delete("/logs/:id", requireAuth, removeExerciseLog);
