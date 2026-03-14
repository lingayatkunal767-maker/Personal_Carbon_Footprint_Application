import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AppLayout from "../components/AppLayout";
import "./Goals.css";

//const GOAL_STORAGE_KEY = "carboncalc_goals";
const API_URL = "http://localhost:8080/api/goals";
const CATEGORIES = [
  { id: "transport", label: "Transport" },
  { id: "food", label: "Food" },
  { id: "energy", label: "Energy" },
];

const TIMEFRAMES = [
  { id: "8_days", label: "Next 8 Days" },
  { id: "15_days", label: "Next 15 Days" },
  { id: "30_days", label: "Next 30 Days" },
];

const RECURRENCE = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
];

// const DEMO_GOALS = [
//   {
//     id: "g1",
//     title: "Bike to work 3 times a week",
//     category: "transport",
//     reductionTarget: 20,
//     timeframe: "8_days",
//     recurrence: "weekly",
//     description: "Replace car commutes with cycling or public transport.",
//     createdAt: new Date().toISOString(),
//     status: "active",
//     progress: 25,
//   },
//   {
//     id: "g2",
//     title: "Keep monthly emissions under 300 kg CO₂",
//     category: "energy",
//     reductionTarget: 30,
//     timeframe: "30_days",
//     recurrence: "monthly",
//     description: "Turn off unused lights, optimize AC usage.",
//     createdAt: new Date().toISOString(),
//     status: "active",
//     progress: 40,
//   },
// ];

// function loadGoals() {
//   try {
//     const raw = localStorage.getItem(GOAL_STORAGE_KEY);
//     if (!raw) return DEMO_GOALS;
//     const parsed = JSON.parse(raw);
//     if (!Array.isArray(parsed) || parsed.length === 0) return DEMO_GOALS;
//     return parsed;
//   } catch {
//     return DEMO_GOALS;
//   }
// }

// function saveGoals(goals) {
//   localStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(goals));
// }

function Goals() {
  const [goals, setGoals] = useState([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("transport");
  const [reductionTarget, setReductionTarget] = useState(15);
  const [timeframe, setTimeframe] = useState("8_days");
  const [recurrence, setRecurrence] = useState("weekly");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);

  // useEffect(() => {
  //   setGoals(loadGoals());
  // }, []);

  // useEffect(() => {
  //   saveGoals(goals);
  // }, [goals]);

  useEffect(() => {
  fetchGoals();
}, []);

const fetchGoals = async () => {
  try {
    const res = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    setGoals(res.data);
  } catch (error) {
    console.error("Error fetching goals", error);
  }
};

  const activeGoals = useMemo(
    () => goals.filter((g) => g.status === "ACTIVE"),
    [goals]
  );

  const completedGoals = useMemo(
    () => goals.filter((g) => g.status === "COMPLETED"),
    [goals]
  );

  const handleCreateOrUpdateGoal = async (e) => {
  e.preventDefault();

  const goalData = {
    goalTitle: title.trim(),
    category,
    reductionTarget: Number(reductionTarget),
    timeframe,
    recurrence,
    description: description.trim(),
  };

  try {
    if (editingId) {
      await axios.put(`${API_URL}/${editingId}`, goalData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
    } else {
      await axios.post(API_URL, goalData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
    }

    fetchGoals();
    setEditingId(null);

    setTitle("");
    setCategory("transport");
    setReductionTarget(15);
    setTimeframe("8_days");
    setRecurrence("weekly");
    setDescription("");
  } catch (error) {
    console.error("Error saving goal", error);
  }
};

  const handleEditGoal = (goal) => {
    setEditingId(goal.id);
    setTitle(goal.goalTitle);
    setCategory(goal.category || "transport");
    setReductionTarget(goal.reductionTarget ?? 15);
    setTimeframe(goal.timeframe || "8_days");
    setRecurrence(goal.recurrence || "weekly");
    setDescription(goal.description || "");
  };

  const handleDeleteGoal = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    fetchGoals();
  } catch (error) {
    console.error("Error deleting goal", error);
  }
};
  const handleProgressChange = async (id, value) => {
  try {
    await axios.put(
      `${API_URL}/${id}`,
      { progressPercentage: Number(value) },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    fetchGoals();
  } catch (error) {
    console.error("Error updating progress", error);
  }
};

  const handleMarkCompleted = async (id) => {
  try {
    await axios.put(
      `${API_URL}/${id}`,
      { status: "COMPLETED", progress: 100 },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    fetchGoals();
  } catch (error) {
    console.error("Error completing goal", error);
  }
};

  const formatTimeframeLabel = (id) => {
    const option = TIMEFRAMES.find((t) => t.id === id);
    return option ? option.label : "";
  };

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return iso;
    }
  };

  return (
    <AppLayout>
      <div className="goals-page">
        <header className="goals-header">
          <div>
            <p className="goals-breadcrumb">Dashboard / Create New Goal</p>
            <h1 className="goals-title">Set a New Sustainability Goal</h1>
            <p className="goals-subtitle">
              Define a clear target to reduce your carbon footprint. Small
              changes lead to big impacts.
            </p>
          </div>
        </header>

        <div className="goals-layout">
          <section className="goals-main card">
            <form onSubmit={handleCreateOrUpdateGoal} className="goals-form">
              <div className="goals-form-section">
                <label className="goals-label" htmlFor="goal-title">
                  Goal title
                </label>
                <input
                  id="goal-title"
                  type="text"
                  className="goals-input"
                  placeholder="E.g. Bike to work 3 times a week"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="goals-form-section">
                <span className="goals-label">Target category</span>
                <div className="goals-category-grid">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`goals-category-chip ${
                        category === cat.id ? "active" : ""
                      }`}
                      onClick={() => setCategory(cat.id)}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="goals-two-column">
                <div className="goals-form-section">
                  <div className="goals-label-row">
                    <span className="goals-label">Reduction target</span>
                    <span className="goals-label-pill">
                      {reductionTarget}% reduction
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="80"
                    step="5"
                    value={reductionTarget}
                    onChange={(e) => setReductionTarget(e.target.value)}
                    className="goals-slider"
                  />
                  <p className="goals-helper">
                    Aim for a realistic decrease from your current baseline.
                  </p>
                </div>

                <div className="goals-form-section">
                  <label className="goals-label" htmlFor="timeframe">
                    Timeframe
                  </label>
                  <select
                    id="timeframe"
                    className="goals-select"
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                  >
                    {TIMEFRAMES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="goals-form-section">
                <span className="goals-label">Recurrence</span>
                <div className="goals-recurrence-row">
                  {RECURRENCE.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      className={`goals-recurrence-chip ${
                        recurrence === r.id ? "active" : ""
                      }`}
                      onClick={() => setRecurrence(r.id)}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="goals-form-section">
                <label className="goals-label" htmlFor="goal-description">
                  Optional description / action plan
                </label>
                <textarea
                  id="goal-description"
                  className="goals-textarea"
                  rows={4}
                  placeholder="Describe the specific actions you’ll take – e.g. Use public transit on every workday instead of driving."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="goals-form-footer">
                <button type="submit" className="btn btn-primary">
                  {editingId ? "Update goal" : "Save goal"}
                </button>
                {/* <span className="goals-footer-hint">
                  You can edit, complete, or delete goals in the list on the right.
                </span> */}
              </div>
            </form>
          </section>

          <aside className="goals-sidebar">
            <section className="card goals-tips-card">
              <h2 className="goals-sidebar-title">Goal Tips</h2>
              <ul className="goals-tips-list">
                <li>
                  <strong>Make it SMART.</strong> Specific, Measurable,
                  Achievable, Relevant, Time-bound.
                </li>
                <li>
                  <strong>Start focused.</strong> Begin with one category such
                  as transport or energy.
                </li>
                <li>
                  <strong>Stack small wins.</strong> Small recurring habits
                  compound into big reductions over time.
                </li>
              </ul>
            </section>

            <section className="card goals-list-card">
              <div className="goals-list-header">
                <h2 className="goals-sidebar-title">Your Goals</h2>
                <span className="goals-pill">
                  {activeGoals.length} active · {completedGoals.length} completed
                </span>
              </div>

              {goals.length === 0 && (
                <p className="goals-empty">
                  No goals yet. Create your first reduction target to get
                  started.
                </p>
              )}

              {goals.length > 0 && (
                <div className="goals-list">
                  {goals.map((goal) => (
                    <article
                      key={goal.id}
                      className={`goals-list-item goals-list-item-${
                        goal.status
                      }`}
                    >
                      <header className="goals-list-item-header">
                        <h3 className="goals-list-title">{goal.goalTitle}</h3>
                        <div className="goals-list-actions">
                          <span className="goals-list-status">
                            {goal.status === "completed" ? "Completed" : "Active"}
                          </span>
                          {/* <button
                            type="button"
                            className="goals-list-btn goals-list-btn-edit"
                            onClick={() => handleEditGoal(goal)}
                          >
                            Edit
                          </button> */}
                          <button
                            type="button"
                            className="goals-list-btn goals-list-btn-delete"
                            onClick={() => handleDeleteGoal(goal.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </header>
                      <p className="goals-list-meta">
                        <span>{goal.category}</span> ·{" "}
                        <span>{goal.reductionTarget}% reduction</span> ·{" "}
                        <span>{formatTimeframeLabel(goal.timeframe)}</span>
                      </p>
                      {goal.description && (
                        <p className="goals-list-description">
                          {goal.description}
                        </p>
                      )}
                      <div className="goals-progress-wrap">
                        <div className="goals-progress-label-row">
                          <span>Progress</span>
                          <span>{Math.round(goal.progressPercentage ?? 0)}%</span>
                        </div>
                        <div className="goals-progress-bar">
                          <div
                            className="goals-progress-bar-fill"
                            style={{ width: `${goal.progressPercentage ?? 0}%` }}
                          />
                        </div>
                        {goal.status === "active" && (
                          <div className="goals-progress-controls">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="5"
                              value={goal.progressPercentage}
                              onChange={(e) =>
                                handleProgressChange(goal.id, e.target.value)
                              }
                            />
                            <button
                              type="button"
                              className="btn btn-secondary goals-complete-btn"
                              onClick={() => handleMarkCompleted(goal.id)}
                            >
                              Mark as completed
                            </button>
                          </div>
                        )}
                        {goal.status === "completed" && (
                          <p className="goals-completed-label">
                            Nice work! This goal has reached 100% completion.
                          </p>
                        )}
                      </div>
                      <p className="goals-list-footer">
                        Created on {formatDate(goal.createdAt)}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}

export default Goals;

