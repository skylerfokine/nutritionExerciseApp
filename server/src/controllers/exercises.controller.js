import { z } from "zod";
import { getExerciseById } from "../models/exercises.model.js";
import { createExerciseLog } from "../models/logs.model.js";

const addExerciseLogSchema = z.object({
  exerciseId: z.number().int().positive(),
  logDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sets: z.number().int().positive().optional(),
  reps: z.number().int().positive().optional(),
  weight_kg: z.number().positive().optional(),
  duration_min: z.number().positive().optional(),
});

export const addExerciseLog = async (req, res) => {
  if (!req.session?.userId)
    return res.status(401).json({ error: "unauthorized" });

  const parsed = addExerciseLogSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "invalid_body", details: parsed.error.issues });
  }

  const { exerciseId, logDate, sets, reps, weight_kg, duration_min } =
    parsed.data;

  // Ensure the exercise exists (avoid 500s from FK constraints later)
  const ex = await getExerciseById(exerciseId);
  if (!ex) return res.status(404).json({ error: "exercise_not_found" });

  const { id } = await createExerciseLog({
    userId: req.session.userId,
    exerciseId,
    logDate,
    sets,
    reps,
    weight_kg,
    duration_min,
  });

  return res.status(201).json({ id, logDate });
};
