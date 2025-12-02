import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { addExerciseLog } from "../controllers/exercises.controller.js";

export const exercisesRouter = Router();
exercisesRouter.post("/logs", requireAuth, addExerciseLog);
