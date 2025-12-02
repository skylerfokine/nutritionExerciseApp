import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { addFoodLog } from "../controllers/foods.controller.js";

export const foodsRouter = Router();
foodsRouter.post("/logs", requireAuth, addFoodLog);
