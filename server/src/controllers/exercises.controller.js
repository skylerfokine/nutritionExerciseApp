import { z } from "zod";
import { getExerciseById } from "../models/exercises.model.js";
import { createExerciseLog } from "../models/logs.model.js";
import { searchExercises } from "../models/exercises.model.js";
import { listExerciseLogs, deleteExerciseLog } from "../models/logs.model.js";

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

const searchQuery = z.object({
  search: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});
export const listExercises = async (req, res) => {
  const q = searchQuery.safeParse(req.query);
  if (!q.success)
    return res
      .status(400)
      .json({ error: "invalid_query", details: q.error.issues });
  const rows = await searchExercises({
    search: q.data.search ?? "",
    limit: q.data.limit ?? 20,
    offset: q.data.offset ?? 0,
  });
  return res.json({ items: rows });
};

const rangeQuery = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  limit: z.coerce.number().int().min(1).max(500).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});
export const listMyExerciseLogs = async (req, res) => {
  if (!req.session?.userId)
    return res.status(401).json({ error: "unauthorized" });
  const q = rangeQuery.safeParse(req.query);
  if (!q.success)
    return res
      .status(400)
      .json({ error: "invalid_query", details: q.error.issues });
  const rows = await listExerciseLogs({
    userId: req.session.userId,
    from: q.data.from,
    to: q.data.to,
    limit: q.data.limit ?? 100,
    offset: q.data.offset ?? 0,
  });
  return res.json({ items: rows });
};

// Optional delete
export const removeExerciseLog = async (req, res) => {
  if (!req.session?.userId)
    return res.status(401).json({ error: "unauthorized" });
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0)
    return res.status(400).json({ error: "invalid_id" });
  const ok = await deleteExerciseLog({ id, userId: req.session.userId });
  return ok
    ? res.status(204).end()
    : res.status(404).json({ error: "not_found" });
};
