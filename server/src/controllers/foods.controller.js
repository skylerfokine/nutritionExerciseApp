import { z } from "zod";
import { getFoodById } from "../models/foods.model.js";
import { searchFoods } from "../models/foods.model.js";
import {
  listFoodLogs,
  createFoodLog,
  deleteFoodLog,
} from "../models/logs.model.js";

// Validate incoming body so DB never sees junk.
const addFoodLogSchema = z.object({
  foodId: z.number().int().positive(),
  quantity: z.number().positive(), // 1 = one serving (your convention)
  logDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
});

export const addFoodLog = async (req, res) => {
  // Must be logged in (requireAuth should guard this, but extra safety)
  if (!req.session?.userId)
    return res.status(401).json({ error: "unauthorized" });

  const parsed = addFoodLogSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "invalid_body", details: parsed.error.issues });
  }

  const { foodId, quantity, logDate } = parsed.data;

  // 1) Find base macros from the clean `foods` table
  const food = await getFoodById(foodId);
  if (!food) return res.status(404).json({ error: "food_not_found" });

  // 2) Denormalize macros at insert time (fast analytics, stable history)
  const calories_kcal = Number(food.calories_kcal) * quantity;
  const protein_g = Number(food.protein_g) * quantity;
  const fat_g = Number(food.fat_g) * quantity;
  const carbs_g = Number(food.carbs_g) * quantity;

  // 3) Write log row
  const { id } = await createFoodLog({
    userId: req.session.userId,
    foodId,
    quantity,
    logDate,
    calories_kcal,
    protein_g,
    fat_g,
    carbs_g,
  });

  return res
    .status(201)
    .json({ id, logDate, calories_kcal, protein_g, fat_g, carbs_g });
};

const searchQuery = z.object({
  search: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export const listFoods = async (req, res) => {
  const q = searchQuery.safeParse(req.query);
  if (!q.success)
    return res
      .status(400)
      .json({ error: "invalid_query", details: q.error.issues });

  const items = await searchFoods({
    search: q.data.search ?? "",
    limit: q.data.limit ?? 20,
    offset: q.data.offset ?? 0,
  });

  res.json({ items });
};

const rangeQuery = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  limit: z.coerce.number().int().min(1).max(500).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});
export const listMyFoodLogs = async (req, res) => {
  if (!req.session?.userId)
    return res.status(401).json({ error: "unauthorized" });
  const q = rangeQuery.safeParse(req.query);
  if (!q.success)
    return res
      .status(400)
      .json({ error: "invalid_query", details: q.error.issues });
  const rows = await listFoodLogs({
    userId: req.session.userId,
    from: q.data.from,
    to: q.data.to,
    limit: q.data.limit ?? 100,
    offset: q.data.offset ?? 0,
  });
  return res.json({ items: rows });
};

export const removeFoodLog = async (req, res) => {
  if (!req.session?.userId)
    return res.status(401).json({ error: "unauthorized" });
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0)
    return res.status(400).json({ error: "invalid_id" });

  const ok = await deleteFoodLog({ id, userId: req.session.userId });
  return ok
    ? res.status(204).end()
    : res.status(404).json({ error: "not_found" });
};
