import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  addFoodLog,
  listMyFoodLogs,
  listFoods,
  removeFoodLog,
} from "../controllers/foods.controller.js";

export const foodsRouter = Router();

// browse/search foods (public)
foodsRouter.get("/", listFoods);

// my food logs (auth)
foodsRouter.get("/logs", requireAuth, listMyFoodLogs);

// add new log (auth)
foodsRouter.post("/logs", requireAuth, addFoodLog);

// delete a food log you own
foodsRouter.delete("/logs/:id", requireAuth, removeFoodLog);
