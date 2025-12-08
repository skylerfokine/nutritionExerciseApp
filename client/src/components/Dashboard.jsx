import React, { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost, apiDelete, apiPatch } from "../lib/api";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const BODY_PARTS = [
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Arms",
  "Core",
  "Full body",
];

// UI chip → dataset aliases
const BODY_PART_ALIASES = {
  Chest: ["chest", "pectorals", "pecs"],
  Back: ["back", "upper back", "lower back", "lats", "latissimus"],
  Legs: [
    "legs",
    "upper legs",
    "lower legs",
    "thighs",
    "quadriceps",
    "hamstrings",
    "glutes",
    "calves",
  ],
  Shoulders: ["shoulders", "delts", "deltoids"],
  Arms: ["arms", "biceps", "triceps", "forearms"],
  Core: ["core", "abs", "abdominals", "waist"],
  "Full body": ["full body", "total body", "compound"],
};

function matchesBodyPart(uiPart, value) {
  if (!value) return false;
  const v = String(value).toLowerCase();
  const aliases = BODY_PART_ALIASES[uiPart] || [];
  return aliases.some((a) => v.includes(a));
}

// dates
function startOfWeekMonday(d = new Date()) {
  const date = new Date(d);
  const day = date.getDay(); // 0..6
  const diffToMon = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diffToMon);
  date.setHours(0, 0, 0, 0);
  return date;
}
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function toISODate(date) {
  const y = date.getFullYear(),
    m = String(date.getMonth() + 1).padStart(2, "0"),
    d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function kcalTarget(goal) {
  return goal === "Cutting" ? 2000 : goal === "Bulking" ? 2800 : 2400;
}

export default function Dashboard({ user }) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [mealGoal, setMealGoal] = useState("Maintaining");

  // searches
  const [workoutSearch, setWorkoutSearch] = useState("");
  const [workoutSuggestions, setWorkoutSuggestions] = useState([]);
  const [selectedBodyPart, setSelectedBodyPart] = useState(null);

  const [mealSearch, setMealSearch] = useState("");
  const [mealSuggestions, setMealSuggestions] = useState([]);

  // week window
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeekMonday(new Date()),
  );
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );
  const from = toISODate(weekDays[0]),
    to = toISODate(weekDays[6]);

  // logs
  const [workoutLogsByDay, setWorkoutLogsByDay] = useState(() =>
    Array.from({ length: 7 }, () => []),
  );
  const [foodLogsByDay, setFoodLogsByDay] = useState(() =>
    Array.from({ length: 7 }, () => []),
  );
  const [macroDays, setMacroDays] = useState([]);

  // inline edit state
  const [editingId, setEditingId] = useState(null);
  const [editSets, setEditSets] = useState("");
  const [editReps, setEditReps] = useState("");
  const [editWeight, setEditWeight] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [editError, setEditError] = useState("");

  const todayKcal = foodLogsByDay[selectedDayIndex].reduce(
    (s, f) => s + (Number(f.calories_kcal) || 0),
    0,
  );
  const targetKcal = kcalTarget(mealGoal);

  // load logs + macros for week
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [exRes, foodRes, macroRes] = await Promise.all([
          apiGet("/exercises/logs", { from, to, limit: 500, offset: 0 }),
          apiGet("/foods/logs", { from, to, limit: 500, offset: 0 }),
          apiGet("/analytics/macros", { from, to }),
        ]);
        if (cancelled) return;

        const exBuckets = Array.from({ length: 7 }, () => []);
        (exRes.items || []).forEach((row) => {
          const idx = (new Date(row.log_date).getDay() + 6) % 7; // Mon=0
          exBuckets[idx].push({ ...row, display: `#${row.exercise_id}` });
        });

        const foodBuckets = Array.from({ length: 7 }, () => []);
        (foodRes.items || []).forEach((row) => {
          const idx = (new Date(row.log_date).getDay() + 6) % 7;
          foodBuckets[idx].push({ ...row, display: `#${row.food_id}` });
        });

        setWorkoutLogsByDay(exBuckets);
        setFoodLogsByDay(foodBuckets);
        setMacroDays(macroRes.days || []);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [from, to]);

  // exercise search while typing
  useEffect(() => {
    const q = workoutSearch.trim();
    if (!q) {
      if (!selectedBodyPart) setWorkoutSuggestions([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await apiGet("/exercises", { search: q, limit: 8 });
        const items = (res.items || []).map((r) => ({
          id: r.id,
          name: r.title || r.name || `Exercise #${r.id}`,
          body_part: r.body_part,
        }));
        setWorkoutSuggestions(items);
      } catch {
        setWorkoutSuggestions([]);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [workoutSearch, selectedBodyPart]);

  // muscle chip suggestions (when input empty)
  useEffect(() => {
    const run = async () => {
      if (!selectedBodyPart || workoutSearch.trim()) return;
      try {
        const res = await apiGet("/exercises", { limit: 100 }); // obey server cap
        const filtered = (res.items || [])
          .filter((r) => matchesBodyPart(selectedBodyPart, r.body_part))
          .slice(0, 5)
          .map((r) => ({
            id: r.id,
            name: r.title || r.name || `Exercise #${r.id}`,
            body_part: r.body_part,
          }));
        setWorkoutSuggestions(filtered);
      } catch {
        setWorkoutSuggestions([]);
      }
    };
    run();
  }, [selectedBodyPart, workoutSearch]);

  // food search
  useEffect(() => {
    const q = mealSearch.trim();
    if (!q) {
      setMealSuggestions([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await apiGet("/foods", { search: q, limit: 8 });
        const items = (res.items || []).map((r) => ({
          id: r.id,
          name: r.name || `Food #${r.id}`,
        }));
        setMealSuggestions(items);
      } catch {
        setMealSuggestions([]);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [mealSearch]);

  /* ============== Actions (workouts) ============== */

  // Select a suggestion → create log (name only), then auto-open inline edit
  const handleAddExerciseToDay = async (dayIndex, exercise) => {
    const logDate = toISODate(weekDays[dayIndex]);
    try {
      const created = await apiPost("/exercises/logs", {
        exerciseId: exercise.id,
        logDate,
      });
      setWorkoutLogsByDay((prev) => {
        const next = prev.map((arr) => [...arr]);
        next[dayIndex].unshift({
          id: created.id,
          exercise_id: exercise.id,
          log_date: logDate,
          display: exercise.name || `#${exercise.id}`,
          sets: created.sets ?? null,
          reps: created.reps ?? null,
          weight_kg: created.weight_kg ?? null,
          duration_min: created.duration_min ?? null,
        });
        return next;
      });

      // auto-open inline edit on the new row
      setEditingId(created.id);
      setEditError("");
      setEditSets("");
      setEditReps("");
      setEditWeight("");
      setEditDuration("");
      setWorkoutSearch("");
    } catch (e) {
      console.error("add exercise log failed", e);
    }
  };

  const openEditExercise = (row) => {
    setEditingId(row.id);
    setEditError("");
    setEditSets(row.sets ?? "");
    setEditReps(row.reps ?? "");
    setEditWeight(row.weight_kg ?? "");
    setEditDuration(row.duration_min ?? "");
  };

  const cancelEditExercise = () => {
    setEditingId(null);
    setEditError("");
  };

  const saveEditExercise = async (dayIndex, row) => {
    setEditError("");
    const body = {};
    const num = (v) => (v === "" ? undefined : Number(v));

    const setsVal = num(editSets);
    const repsVal = num(editReps);
    const weightVal = num(editWeight);
    const durationVal = num(editDuration);

    if (setsVal !== undefined && (!Number.isInteger(setsVal) || setsVal <= 0))
      return setEditError("Sets must be a positive integer.");
    if (repsVal !== undefined && (!Number.isInteger(repsVal) || repsVal <= 0))
      return setEditError("Reps must be a positive integer.");
    if (
      weightVal !== undefined &&
      (!Number.isFinite(weightVal) || weightVal < 0)
    )
      return setEditError("Weight must be ≥ 0.");
    if (
      durationVal !== undefined &&
      (!Number.isFinite(durationVal) || durationVal <= 0)
    )
      return setEditError("Duration must be > 0.");

    if (setsVal !== undefined) body.sets = setsVal;
    if (repsVal !== undefined) body.reps = repsVal;
    if (weightVal !== undefined) body.weight_kg = weightVal;
    if (durationVal !== undefined) body.duration_min = durationVal;

    try {
      const updated = await apiPatch(`/exercises/logs/${row.id}`, body);
      setWorkoutLogsByDay((prev) =>
        prev.map((arr) =>
          arr.map((r) => (r.id === row.id ? { ...r, ...updated } : r)),
        ),
      );
      setEditingId(null);
    } catch (e) {
      setEditError(e?.data?.message || "Failed to save changes.");
    }
  };

  const removeExercise = async (dayIndex, indexInList) => {
    const row = workoutLogsByDay[dayIndex][indexInList];
    if (!row) return;
    try {
      await apiDelete(`/exercises/logs/${row.id}`);
      setWorkoutLogsByDay((prev) => {
        const next = prev.map((arr) => [...arr]);
        next[dayIndex].splice(indexInList, 1);
        return next;
      });
    } catch (e) {
      console.error("delete exercise log failed", e);
    }
  };

  const toggleBodyPart = (part) => {
    setSelectedBodyPart((prev) => (prev === part ? null : part));
    setWorkoutSearch("");
    setEditingId(null);
  };

  /* ============== Actions (foods) ============== */

  const addMeal = async (dayIndex, meal) => {
    const logDate = toISODate(weekDays[dayIndex]);
    try {
      const created = await apiPost("/foods/logs", {
        foodId: meal.id,
        quantity: 1,
        logDate,
      });
      setFoodLogsByDay((prev) => {
        const next = prev.map((arr) => [...arr]);
        next[dayIndex].unshift({
          id: created.id,
          food_id: meal.id,
          log_date: logDate,
          calories_kcal: created.calories_kcal,
          protein_g: created.protein_g,
          fat_g: created.fat_g,
          carbs_g: created.carbs_g,
          display: meal.name || `#${meal.id}`,
        });
        return next;
      });
      setMealSearch("");
      try {
        const macroRes = await apiGet("/analytics/macros", { from, to });
        setMacroDays(macroRes.days || []);
      } catch {}
    } catch (e) {
      console.error("add food log failed", e);
    }
  };

  const removeMeal = async (dayIndex, indexInList) => {
    const row = foodLogsByDay[dayIndex][indexInList];
    if (!row) return;
    try {
      await apiDelete(`/foods/logs/${row.id}`);
      setFoodLogsByDay((prev) => {
        const next = prev.map((arr) => [...arr]);
        next[dayIndex].splice(indexInList, 1);
        return next;
      });
      try {
        const macroRes = await apiGet("/analytics/macros", { from, to });
        setMacroDays(macroRes.days || []);
      } catch {}
    } catch (e) {
      console.error("delete food log failed", e);
    }
  };

  /* ===================== UI ===================== */

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-title-row">
          <h1 className="dashboard-title">Your week</h1>
          <div className="week-controls">
            <button
              className="chip"
              onClick={() => setWeekStart(addDays(weekStart, -7))}
            >
              ← Prev
            </button>
            <button
              className="chip"
              onClick={() => setWeekStart(startOfWeekMonday(new Date()))}
            >
              This week
            </button>
            <button
              className="chip"
              onClick={() => setWeekStart(addDays(weekStart, +7))}
            >
              Next →
            </button>
          </div>
        </div>
        <p className="dashboard-subtitle">
          Weekly schedule for workouts & meals. Currently viewing{" "}
          <strong>{from}</strong> → <strong>{to}</strong>.
        </p>
        <DaySelector
          selectedIndex={selectedDayIndex}
          onSelect={(i) => {
            setSelectedDayIndex(i);
            setEditingId(null);
          }}
        />
      </header>

      <section className="dashboard-grid">
        {/* WORKOUTS */}
        <div className="dashboard-card">
          <h2 className="section-title">Workouts</h2>

          <div className="workout-controls">
            <div className="body-parts">
              {BODY_PARTS.map((part) => {
                const active = selectedBodyPart === part;
                return (
                  <button
                    key={part}
                    className={`chip ${active ? "chip--active" : ""}`}
                    onClick={() => toggleBodyPart(part)}
                  >
                    {part}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="workout-search-block">
            <label>
              Add exercise
              <input
                className="search-input"
                type="text"
                placeholder="Search workouts (e.g., bench, squat...)"
                value={workoutSearch}
                onChange={(e) => {
                  setWorkoutSearch(e.target.value);
                  setEditingId(null);
                }}
              />
            </label>

            {(workoutSearch ||
              (selectedBodyPart && workoutSuggestions.length > 0)) && (
              <ul className="suggestion-list">
                {workoutSuggestions.length === 0 ? (
                  <li className="suggestion-item suggestion-empty">
                    {workoutSearch
                      ? "No matching exercises."
                      : "No exercises for this muscle group."}
                  </li>
                ) : (
                  workoutSuggestions.map((ex) => (
                    <li key={ex.id} className="suggestion-item">
                      <button
                        className="suggestion-button"
                        onClick={() =>
                          handleAddExerciseToDay(selectedDayIndex, ex)
                        }
                        title={
                          ex.body_part ? `Target: ${ex.body_part}` : undefined
                        }
                      >
                        {ex.name}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          <ul className="item-list">
            {workoutLogsByDay[selectedDayIndex].length === 0 ? (
              <li className="item-muted">No workouts logged yet.</li>
            ) : (
              workoutLogsByDay[selectedDayIndex].map((w, index) => {
                const isEditing = editingId === w.id;
                return (
                  <li key={w.id} className="item-row">
                    <div className="item-main" style={{ width: "100%" }}>
                      <span className="item-name">
                        {w.display || `#${w.exercise_id}`}
                      </span>
                      {!isEditing && (
                        <span className="item-meta" style={{ marginLeft: 8 }}>
                          {w.sets ? `${w.sets}×` : ""}
                          {w.reps ? `${w.reps}` : ""}
                          {w.weight_kg ? ` @ ${w.weight_kg}kg` : ""}
                          {w.duration_min ? ` · ${w.duration_min}min` : ""}
                        </span>
                      )}

                      {isEditing && (
                        <div className="inline-form" style={inlineFormStyle}>
                          <div style={inlineRow}>
                            <label style={inlineLabel}>
                              Sets
                              <input
                                className="search-input"
                                type="number"
                                min={1}
                                step={1}
                                value={editSets}
                                onChange={(e) => setEditSets(e.target.value)}
                                style={smallNumInput}
                              />
                            </label>
                            <label style={inlineLabel}>
                              Reps
                              <input
                                className="search-input"
                                type="number"
                                min={1}
                                step={1}
                                value={editReps}
                                onChange={(e) => setEditReps(e.target.value)}
                                style={smallNumInput}
                              />
                            </label>
                            <label style={inlineLabel}>
                              Weight (kg)
                              <input
                                className="search-input"
                                type="number"
                                min={0}
                                step="0.5"
                                value={editWeight}
                                onChange={(e) => setEditWeight(e.target.value)}
                                style={smallNumInput}
                                placeholder="optional"
                              />
                            </label>
                            <label style={inlineLabel}>
                              Duration (min)
                              <input
                                className="search-input"
                                type="number"
                                min={1}
                                step="1"
                                value={editDuration}
                                onChange={(e) =>
                                  setEditDuration(e.target.value)
                                }
                                style={smallNumInput}
                                placeholder="optional"
                              />
                            </label>
                          </div>

                          {editError && <div style={errorBox}>{editError}</div>}

                          <div style={inlineActions}>
                            <button
                              className="chip"
                              onClick={cancelEditExercise}
                            >
                              Cancel
                            </button>
                            <button
                              className="chip"
                              onClick={() =>
                                saveEditExercise(selectedDayIndex, w)
                              }
                              style={{
                                background: "#0ea5e9",
                                color: "#0b1120",
                              }}
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {!isEditing && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          className="chip"
                          onClick={() => openEditExercise(w)}
                        >
                          Edit
                        </button>
                        <button
                          className="small-danger-btn"
                          onClick={() =>
                            removeExercise(selectedDayIndex, index)
                          }
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>

        {/* MEALS */}
        <div className="dashboard-card">
          <div className="section-title-row">
            <h2 className="section-title">Meals</h2>
            <select
              value={mealGoal}
              onChange={(e) => setMealGoal(e.target.value)}
              className="goal-select"
            >
              <option>Cutting</option>
              <option>Maintaining</option>
              <option>Bulking</option>
            </select>
          </div>

          <div className="meal-search-block">
            <label>
              Add meal / food
              <input
                className="search-input"
                type="text"
                placeholder="Search foods (e.g., chicken, rice...)"
                value={mealSearch}
                onChange={(e) => setMealSearch(e.target.value)}
              />
            </label>

            {mealSearch && (
              <ul className="suggestion-list">
                {mealSuggestions.length === 0 ? (
                  <li className="suggestion-item suggestion-empty">
                    No matching foods.
                  </li>
                ) : (
                  mealSuggestions.map((meal) => (
                    <li key={meal.id} className="suggestion-item">
                      <button
                        className="suggestion-button"
                        onClick={() => addMeal(selectedDayIndex, meal)}
                      >
                        {meal.name}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          {foodLogsByDay[selectedDayIndex].length === 0 ? (
            <div className="item-muted">No meals logged yet.</div>
          ) : (
            <ul className="item-list">
              {foodLogsByDay[selectedDayIndex].map((m, index) => (
                <li key={m.id} className="item-row">
                  <div className="item-main">
                    <span className="item-name">
                      {m.display || `#${m.food_id}`}
                    </span>
                    <span className="item-meta">
                      {Math.round(m.calories_kcal)} kcal · P:
                      {Math.round(m.protein_g)}g · F:{Math.round(m.fat_g)}g · C:
                      {Math.round(m.carbs_g)}g
                    </span>
                  </div>
                  <button
                    className="small-danger-btn"
                    onClick={() => removeMeal(selectedDayIndex, index)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="meal-summary">
            <div className="meal-summary-row">
              <span>Calories today</span>
              <strong>
                {Math.round(todayKcal)} / {targetKcal} kcal
              </strong>
            </div>
          </div>
        </div>

        {/* MACROS */}
        <div className="dashboard-card">
          <h2 className="section-title">Macro view (this week)</h2>
          {macroDays.length === 0 ? (
            <div className="item-muted">
              No macro data yet — add meals to see totals.
            </div>
          ) : (
            <ul className="item-list">
              {macroDays.map((d) => (
                <li key={d.log_date} className="item-row">
                  <div className="item-main">
                    <span className="item-name">{d.log_date}</span>
                    <span className="item-meta">
                      {Math.round(d.calories_kcal)} kcal · P:
                      {Math.round(d.protein_g)}g · F:{Math.round(d.fat_g)}g · C:
                      {Math.round(d.carbs_g)}g
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function DaySelector({ selectedIndex, onSelect }) {
  return (
    <div className="day-selector">
      {DAYS.map((day, idx) => (
        <button
          key={day}
          className={`day-chip ${idx === selectedIndex ? "day-chip--active" : ""}`}
          onClick={() => onSelect(idx)}
        >
          {day}
        </button>
      ))}
    </div>
  );
}

// inline form styles
const inlineFormStyle = {
  marginTop: 10,
  padding: "10px 12px",
  border: "1px solid rgba(148,163,184,.25)",
  borderRadius: 8,
  background: "rgba(2,6,23,.5)",
};
const inlineRow = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0,1fr))",
  gap: 8,
  alignItems: "end",
  marginTop: 6,
};
const inlineLabel = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  color: "#e2e8f0",
};
const smallNumInput = {
  padding: "8px",
  borderRadius: 6,
  border: "1px solid #555",
  background: "rgba(2,6,23,.7)",
  color: "#f9fafb",
  outline: "none",
};
const inlineActions = { marginTop: 10, display: "flex", gap: 8 };
const errorBox = {
  marginTop: 8,
  padding: "8px 10px",
  borderRadius: 6,
  border: "1px solid rgba(239,68,68,.35)",
  background: "rgba(239,68,68,.12)",
  color: "#fecaca",
  fontSize: ".9rem",
};
