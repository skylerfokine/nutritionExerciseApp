import { z } from "zod";
import { getExerciseById } from "../models/exercises.model.js";
import { createExerciseLog } from "../models/logs.model.js";
import { searchExercises } from "../models/exercises.model.js";
import { listExerciseLogs, deleteExerciseLog } from "../models/logs.model.js";
import { updateExerciseLogForUser } from "../models/exerciseLogs.model.js";

/* -------------------- CREATE (POST /exercises/logs) -------------------- */

const addExerciseLogSchema = z.object({
  exerciseId: z.number().int().positive(),
  logDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sets: z.number().int().positive().optional(),
  reps: z.number().int().positive().optional(),
  // NOTE: you used positive() here, so 0 is NOT allowed on create.
  // If you want to allow bodyweight (0 kg), change to .nonnegative()
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

/* -------------------- LIST EXERCISES (GET /exercises) -------------------- */

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

/* ---------- LIST MY LOGS (GET /exercises/logs?from&to&...) ---------- */

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

/* -------------------- DELETE (DELETE /exercises/logs/:id) -------------------- */

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

/* -------------------- UPDATE (PATCH /exercises/logs/:id) -------------------- */
/* New bits for inline edit (sets, reps, weight_kg, duration_min) */

const patchIdParam = z.object({
  id: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().positive()),
});

// For PATCH we allow any subset, but require at least one key.
// Using .coerce so numeric strings from JSON still pass.
const patchExerciseBody = z
  .object({
    sets: z.coerce.number().int().positive().optional(),
    reps: z.coerce.number().int().positive().optional(),
    // Here I allow 0 with nonnegative() so you can record bodyweight sets.
    // Change to .positive() if you want to disallow 0.
    weight_kg: z.coerce.number().nonnegative().optional(),
    duration_min: z.coerce.number().positive().optional(),
  })
  .refine((obj) => Object.values(obj).some((v) => v !== undefined), {
    message: "Provide at least one field to update.",
  });

export const updateExerciseLog = async (req, res, next) => {
  try {
    if (!req.session?.userId)
      return res.status(401).json({ error: "unauthorized" });

    const { id: logId } = patchIdParam.parse(req.params);
    const fields = patchExerciseBody.parse(req.body);

    const updated = await updateExerciseLogForUser({
      logId,
      userId: req.session.userId,
      fields,
    });

    if (!updated) return res.status(404).json({ error: "not_found" });
    return res.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "invalid_body", details: err.issues });
    }
    return next(err);
  }
};
