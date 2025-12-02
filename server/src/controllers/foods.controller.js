import { z } from "zod";
import { getFoodById } from "../models/foods.model.js";
import { createFoodLog } from "../models/logs.model.js";

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
