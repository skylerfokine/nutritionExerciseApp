import React, { useState } from "react";

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

// Stub workout + meal data – later plug into your real datasets
const MOCK_EXERCISES = [
  { id: 1, name: "Bench Press" },
  { id: 2, name: "Squat" },
  { id: 3, name: "Deadlift" },
  { id: 4, name: "Pull-ups" },
  { id: 5, name: "Running (treadmill)" },
  { id: 6, name: "Cycling (stationary)" },
  { id: 7, name: "Overhead Press" },
  { id: 8, name: "Lat Pulldown" },
];

const MOCK_MEALS = [
  { id: 1, name: "Grilled chicken with rice", calories: 600 },
  { id: 2, name: "Oatmeal with berries", calories: 350 },
  { id: 3, name: "Greek yogurt and granola", calories: 280 },
  { id: 4, name: "Protein shake", calories: 200 },
  { id: 5, name: "Salmon with veggies", calories: 550 },
  { id: 6, name: "Turkey sandwich", calories: 450 },
  { id: 7, name: "Avocado toast", calories: 320 },
];

function filterByQuery(list, query) {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return list.filter((item) => item.name.toLowerCase().includes(q)).slice(0, 8);
}

function getCalorieTargetForGoal(goal) {
  switch (goal) {
    case "Bulking":
      return 2800;
    case "Cutting":
      return 2000;
    case "Maintaining":
    default:
      return 2400;
  }
}

export default function Dashboard({ user, onUserUpdate }) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  // profile / friends
  const [avatarPreview, setAvatarPreview] = useState(user.avatarUrl || "");
  const [outgoingRequests] = useState([
    { id: "out-1", name: "alice" },
    { id: "out-2", name: "gymBro42" },
  ]);
  const [incomingRequests, setIncomingRequests] = useState([
    { id: "in-1", name: "charlie" },
    { id: "in-2", name: "swoleSam" },
  ]);

  // weekly workout + meals
  const [weeklyWorkoutPlan, setWeeklyWorkoutPlan] = useState(() =>
    DAYS.map((day) => ({
      day,
      durationMinutes: 45,
      bodyParts: [],
      exercises: [],
    }))
  );

  const [weeklyMealPlan, setWeeklyMealPlan] = useState(() =>
    DAYS.map((day) => ({
      day,
      meals: [],
    }))
  );

  const [mealGoal, setMealGoal] = useState("Maintaining");

  // search state
  const [workoutSearch, setWorkoutSearch] = useState("");
  const [mealSearch, setMealSearch] = useState("");

  const workoutSuggestions = filterByQuery(MOCK_EXERCISES, workoutSearch);
  const mealSuggestions = filterByQuery(MOCK_MEALS, mealSearch);

  const currentWorkout = weeklyWorkoutPlan[selectedDayIndex];
  const currentMeals = weeklyMealPlan[selectedDayIndex];

  const todayCalories = currentMeals.meals.reduce(
    (sum, meal) => sum + (meal.calories || 0),
    0
  );
  const calorieTarget = getCalorieTargetForGoal(mealGoal);

  // handlers

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
    onUserUpdate?.({ avatarUrl: url });
  };

  const handleUsernameChange = (e) => {
    onUserUpdate?.({ username: e.target.value });
  };

  const handleAcceptFriend = (id) => {
    setIncomingRequests((prev) => prev.filter((r) => r.id !== id));
    console.log("Accepted friend request:", id);
  };

  const handleDeclineFriend = (id) => {
    setIncomingRequests((prev) => prev.filter((r) => r.id !== id));
    console.log("Declined friend request:", id);
  };

  const updateWorkoutDay = (dayIndex, partial) => {
    setWeeklyWorkoutPlan((prev) =>
      prev.map((dayPlan, idx) =>
        idx === dayIndex ? { ...dayPlan, ...partial } : dayPlan
      )
    );
  };

  const updateMealDay = (dayIndex, partial) => {
    setWeeklyMealPlan((prev) =>
      prev.map((dayPlan, idx) =>
        idx === dayIndex ? { ...dayPlan, ...partial } : dayPlan
      )
    );
  };

  const toggleBodyPart = (dayIndex, part) => {
    const current = weeklyWorkoutPlan[dayIndex];
    const exists = current.bodyParts.includes(part);
    const nextBodyParts = exists
      ? current.bodyParts.filter((p) => p !== part)
      : [...current.bodyParts, part];
    updateWorkoutDay(dayIndex, { bodyParts: nextBodyParts });
  };

  const handleWorkoutDurationChange = (dayIndex, value) => {
    const minutes = Number(value) || 0;
    updateWorkoutDay(dayIndex, { durationMinutes: minutes });
  };

  const handleAddExerciseToDay = (dayIndex, exercise) => {
    const current = weeklyWorkoutPlan[dayIndex];
    if (current.exercises.some((e) => e.id === exercise.id)) return;
    const nextExercises = [
      ...current.exercises,
      { ...exercise, sets: 3, reps: 10 },
    ];
    updateWorkoutDay(dayIndex, { exercises: nextExercises });
    setWorkoutSearch("");
  };

  const handleUpdateExerciseField = (dayIndex, exerciseId, field, value) => {
    const current = weeklyWorkoutPlan[dayIndex];
    const nextExercises = current.exercises.map((ex) =>
      ex.id === exerciseId ? { ...ex, [field]: Number(value) || 0 } : ex
    );
    updateWorkoutDay(dayIndex, { exercises: nextExercises });
  };

  const handleRemoveExercise = (dayIndex, exerciseId) => {
    const current = weeklyWorkoutPlan[dayIndex];
    const nextExercises = current.exercises.filter((ex) => ex.id !== exerciseId);
    updateWorkoutDay(dayIndex, { exercises: nextExercises });
  };

  const handleAddMealToDay = (dayIndex, meal) => {
    const current = weeklyMealPlan[dayIndex];
    const nextMeals = [...current.meals, meal];
    updateMealDay(dayIndex, { meals: nextMeals });
    setMealSearch("");
  };

  const handleRemoveMealFromDay = (dayIndex, index) => {
    const current = weeklyMealPlan[dayIndex];
    const nextMeals = current.meals.filter((_, i) => i !== index);
    updateMealDay(dayIndex, { meals: nextMeals });
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">
            Weekly schedule for workouts & meals. Currently viewing{" "}
            <strong>{DAYS[selectedDayIndex]}</strong>.
          </p>
        </div>
        <DaySelector
          selectedIndex={selectedDayIndex}
          onSelect={setSelectedDayIndex}
        />
      </header>

      <div className="dashboard-grid">
        {/* Profile section */}
        <section className="dashboard-card profile-section">
          <h2 className="section-title">Profile</h2>
          <div className="profile-main">
            <div className="profile-avatar-wrapper">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Profile"
                  className="profile-avatar"
                />
              ) : (
                <div className="profile-avatar profile-avatar--placeholder">
                  {user.username?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              <label className="profile-upload-btn">
                Change picture
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: "none" }}
                />
              </label>
            </div>

            <div className="profile-fields">
              <label className="profile-field">
                Username
                <input
                  type="text"
                  value={user.username || ""}
                  onChange={handleUsernameChange}
                />
              </label>

              <label className="profile-field">
                Email
                <input type="email" value={user.email || ""} disabled />
              </label>

              <label className="profile-field">
                User ID
                <input type="text" value={user.id || ""} disabled />
              </label>
            </div>
          </div>

          <div className="friends-section">
            <h3 className="subsection-title">Friends</h3>

            <div className="friends-lists">
              <div className="friends-column">
                <h4 className="friends-heading">Outgoing requests</h4>
                {outgoingRequests.length === 0 ? (
                  <p className="empty-text">No outgoing requests.</p>
                ) : (
                  <ul className="simple-list">
                    {outgoingRequests.map((req) => (
                      <li key={req.id}>{req.name}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="friends-column">
                <h4 className="friends-heading">Incoming requests</h4>
                {incomingRequests.length === 0 ? (
                  <p className="empty-text">No incoming requests.</p>
                ) : (
                  <ul className="simple-list">
                    {incomingRequests.map((req) => (
                      <li key={req.id} className="friend-request-item">
                        <span>{req.name}</span>
                        <div className="friend-request-actions">
                          <button
                            type="button"
                            onClick={() => handleAcceptFriend(req.id)}
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeclineFriend(req.id)}
                          >
                            Decline
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Workout section */}
        <section className="dashboard-card workout-section">
          <h2 className="section-title">
            Workout – {DAYS[selectedDayIndex]}
          </h2>

          <p className="section-help">
            View and edit your workout plan for this day. This mirrors your
            weekly schedule.
          </p>

          <div className="workout-today">
            <div className="field-inline">
              <label>
                Session duration (minutes)
                <input
                  type="number"
                  min="0"
                  value={currentWorkout.durationMinutes}
                  onChange={(e) =>
                    handleWorkoutDurationChange(selectedDayIndex, e.target.value)
                  }
                />
              </label>
            </div>

            <div className="bodyparts-row">
              <span className="bodyparts-label">Body parts:</span>
              <div className="bodyparts-chips">
                {BODY_PARTS.map((part) => {
                  const active = currentWorkout.bodyParts.includes(part);
                  return (
                    <button
                      key={part}
                      type="button"
                      className={`chip ${active ? "chip--active" : ""}`}
                      onClick={() => toggleBodyPart(selectedDayIndex, part)}
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
                  onChange={(e) => setWorkoutSearch(e.target.value)}
                />
              </label>

              {workoutSearch && (
                <ul className="suggestion-list">
                  {workoutSuggestions.length === 0 ? (
                    <li className="suggestion-item suggestion-empty">
                      No matching exercises. This will eventually query your real
                      workout dataset.
                    </li>
                  ) : (
                    workoutSuggestions.map((exercise) => (
                      <li key={exercise.id} className="suggestion-item">
                        <button
                          type="button"
                          className="suggestion-button"
                          onClick={() =>
                            handleAddExerciseToDay(selectedDayIndex, exercise)
                          }
                        >
                          {exercise.name}
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>

            <h3 className="subsection-title">Planned exercises</h3>
            {currentWorkout.exercises.length === 0 ? (
              <p className="empty-text">
                No exercises yet. Add some from the search box above.
              </p>
            ) : (
              <ul className="exercise-list">
                {currentWorkout.exercises.map((ex) => (
                  <li key={ex.id} className="exercise-item">
                    <div className="exercise-main">
                      <span className="exercise-name">{ex.name}</span>
                      <div className="exercise-fields">
                        <label>
                          Sets
                          <input
                            type="number"
                            min="0"
                            value={ex.sets}
                            onChange={(e) =>
                              handleUpdateExerciseField(
                                selectedDayIndex,
                                ex.id,
                                "sets",
                                e.target.value
                              )
                            }
                          />
                        </label>
                        <label>
                          Reps
                          <input
                            type="number"
                            min="0"
                            value={ex.reps}
                            onChange={(e) =>
                              handleUpdateExerciseField(
                                selectedDayIndex,
                                ex.id,
                                "reps",
                                e.target.value
                              )
                            }
                          />
                        </label>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="small-danger-btn"
                      onClick={() =>
                        handleRemoveExercise(selectedDayIndex, ex.id)
                      }
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="section-help section-help--footer">
            Weekly view: switch days at the top to adjust your plan for any day.
          </p>
        </section>

        {/* Meal plan section */}
        <section className="dashboard-card meal-section">
          <h2 className="section-title">
            Meal plan – {DAYS[selectedDayIndex]}
          </h2>

          <div className="meal-goal-row">
            <label>
              Goal
              <select
                value={mealGoal}
                onChange={(e) => setMealGoal(e.target.value)}
              >
                <option value="Bulking">Bulking</option>
                <option value="Cutting">Cutting</option>
                <option value="Maintaining">Maintaining</option>
              </select>
            </label>

            <div className="calorie-target">
              <span className="calorie-target-label">Target:</span>
              <span className="calorie-target-value">
                {calorieTarget} kcal / day
              </span>
            </div>
          </div>

          <p className="section-help">
            Daily view: these meals and calories are for the selected day only.
            Weekly schedule comes from editing each day via the day selector.
          </p>

          <div className="meal-search-block">
            <label>
              Add meal
              <input
                className="search-input"
                type="text"
                placeholder="Search meals (e.g., chicken, oatmeal...)"
                value={mealSearch}
                onChange={(e) => setMealSearch(e.target.value)}
              />
            </label>

            {mealSearch && (
              <ul className="suggestion-list">
                {mealSuggestions.length === 0 ? (
                  <li className="suggestion-item suggestion-empty">
                    No matching meals. This will eventually query your meals
                    dataset.
                  </li>
                ) : (
                  mealSuggestions.map((meal) => (
                    <li key={meal.id} className="suggestion-item">
                      <button
                        type="button"
                        className="suggestion-button"
                        onClick={() =>
                          handleAddMealToDay(selectedDayIndex, meal)
                        }
                      >
                        <span>{meal.name}</span>
                        <span className="suggestion-meta">
                          {meal.calories} kcal
                        </span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          <h3 className="subsection-title">Meals for this day</h3>
          {currentMeals.meals.length === 0 ? (
            <p className="empty-text">
              No meals logged yet. Add some from the search box above.
            </p>
          ) : (
            <ul className="meal-list">
              {currentMeals.meals.map((meal, index) => (
                <li key={`${meal.id}-${index}`} className="meal-item">
                  <div>
                    <div className="meal-name">{meal.name}</div>
                    <div className="meal-meta">{meal.calories} kcal</div>
                  </div>
                  <button
                    type="button"
                    className="small-danger-btn"
                    onClick={() =>
                      handleRemoveMealFromDay(selectedDayIndex, index)
                    }
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
                {todayCalories} / {calorieTarget} kcal
              </strong>
            </div>
            <div className="meal-summary-row">
              <span>Weekly view</span>
              <span>
                Use the day selector above to configure meals for each day.
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function DaySelector({ selectedIndex, onSelect }) {
  return (
    <div className="day-selector">
      {DAYS.map((day, idx) => (
        <button
          key={day}
          type="button"
          className={`day-chip ${
            idx === selectedIndex ? "day-chip--active" : ""
          }`}
          onClick={() => onSelect(idx)}
        >
          {day}
        </button>
      ))}
    </div>
  );
}

