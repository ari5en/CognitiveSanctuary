# Cognitive Sanctuary — Codebase Analysis

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Tailwind CSS, Framer Motion, React Router v6, Lucide icons |
| Backend | ASP.NET Core Web API (C#), HttpClient to Supabase REST |
| Database | PostgreSQL via Supabase (hosted) |
| Auth | localStorage-based (currently hardcoded `userId: 1`) |

Both servers run simultaneously:
- **Frontend** → `http://localhost:5173` (`npm run dev`)
- **Backend** → `http://localhost:5197` (`dotnet run`)

---

## 2. Architecture Overview

```
Browser (React SPA)
  └── services/api.js   ← thin fetch wrapper
        └── ASP.NET Core API (port 5197)
              └── Controllers → Services → HttpClient → Supabase REST API
                                                          └── PostgreSQL DB
```

### Backend: Controller → Service → Supabase
The backend is a **proxy layer** — controllers receive requests, delegate to services, and services call Supabase's PostgREST API directly via `HttpClient`. There is no Entity Framework or ORM; SQL is handled entirely by Supabase.

### Frontend as Orchestrator
The **frontend drives business flow**. It decides when to call which API, in what sequence, and how to compose responses into UI state. The backend is essentially a UML-compliant pass-through to the database.

---

## 3. Database Structure

```sql
users (user_id PK, name, email, password, mood_level)
  │
  ├── study_sessions (session_id PK, user_id FK, study_duration, break_count, start_time, end_time)
  │     │
  │     ├── study_tasks (task_id PK, session_id FK, title, estimated_time, status)
  │     │     └── status values: "Pending" | "InProgress" | "Completed"
  │     │
  │     └── burnout_records (record_id PK, session_id FK, burnout_score, burnout_level, timestamp)
  │           └── burnout_level values: "Stable" | "Warning" | "Critical"
  │
  └── study_planner (planner_id PK, user_id FK, recommended_load)
```

> **Key design note:** `study_tasks` are children of `study_sessions`, not of `study_planner`. Planner tasks and session tasks share the same table — a "planning" task is a task attached to a session created by the planner route.

---

## 4. Backend: Models (OOP / UML Layer)

All models follow strict OOP conventions with private fields + public getters (to match a UML class diagram). Inheritance is implemented:

```
StudyTask (base)
  ├── FocusSession  — adds focusLevel, extendFocusTime()
  └── BreakSession  — adds breakDuration
```

| Model | Key Properties | Key Methods |
|---|---|---|
| `StudySession` | sessionId, studyDuration, breakCount, startTime, endTime | startSession(), endSession(), calculateDuration() |
| `StudyTask` | taskId, title, estimatedTime, status | updateTask(), updateMood() |
| `FocusSession : StudyTask` | focusLevel | extendFocusTime() |
| `BreakSession : StudyTask` | breakDuration | (inherited) |
| `BurnoutCalculator` | score | calculateScore(session, mood), getStudyState(score), evaluateRisk() |
| `StudyPlanner` | dailySchedule, recommendedLoad | generateSchedule(user), adjustSchedule(score), optimizePlan() |
| `User` | userId, name, email, password, moodLevel | (getters) |

> **Note:** `FocusSession` and `BreakSession` are **not persisted** to the database as separate types. The DB only has `study_tasks`. These OOP classes exist purely for academic/UML compliance.

---

## 5. Backend: Controllers & API Endpoints

### `SessionsController` → `/api/sessions`
| Method | Route | Purpose |
|---|---|---|
| POST | `/api/sessions` | Create a new study session |
| GET | `/api/sessions/user/{userId}` | Get all sessions for a user |
| GET | `/api/sessions/user/{userId}/tasks` | Get tasks across all sessions for a user |
| POST | `/api/sessions/{sessionId}/tasks` | Add a task to a specific session |
| PATCH | `/api/sessions/{sessionId}/times` | Update start/end time + duration after session ends |

### `PlannerController` → `/api/planner`
| Method | Route | Purpose |
|---|---|---|
| POST | `/api/planner/user/{userId}` | Save/create a planner record |
| GET | `/api/planner/user/{userId}` | Get planner (dynamically adjusted by latest burnout score) |
| GET | `/api/planner/user/{userId}/tasks` | Get tasks (delegates to session service) |
| POST | `/api/planner/user/{userId}/tasks` | Add a task (auto-creates a session if none exists) |
| PUT | `/api/planner/tasks/{taskId}` | Update a task (title, estimatedTime, status) |
| DELETE | `/api/planner/tasks/{taskId}` | Delete a task |

### `BurnoutController` → `/api/burnout`
| Method | Route | Purpose |
|---|---|---|
| POST | `/api/burnout` | Save a burnout record (score → level computed here) |
| GET | `/api/burnout/user/{userId}` | Get latest burnout record (returns baseline Stable/0 if none) |

### `HealthController` → `/health`
| Method | Route | Purpose |
|---|---|---|
| GET | `/health` | Basic alive check |

---

## 6. Frontend: Pages & Components

### Pages (`src/pages/`)

| Page | Route | Role |
|---|---|---|
| `LoginPage.jsx` | `/` | Entry point (stores user in localStorage) |
| `SchedulePage.jsx` | `/schedule` | **PLAN phase** — add/edit/delete tasks |
| `SessionsPage.jsx` | `/sessions` | **EXECUTE phase** — run focus timer |
| `DashboardPage.jsx` | `/dashboard` | **REFLECT phase** — view metrics, burnout, chart |
| `SettingsPage.jsx` | `/settings` | Placeholder only |

### Component Folders (`src/components/`)

```
components/
├── layout/       — Sidebar + Topbar (Layout wrapper)
├── ui/           — Card, Button (shared primitives)
├── sessions/     — SessionTimer, TaskSelector, MentalStateSelector,
│                   BurnoutPrediction, RecentSessions, SessionStats,
│                   TriviaCard, NumberInput, SessionHeader
├── dashboard/    — DashboardHeader, StatusBanner, KPICards,
│                   BurnoutRiskGauge, FocusFlowChart,
│                   Milestones, QuickActions
└── schedule/     — ScheduleHeader, AlertBanner, PriorityFocus,
                    RestMode, FocusResilience, DailyReflection
```

### API Layer (`src/services/api.js`)
Single file, exports named async functions. Base URL reads from `VITE_API_BASE_URL` env var, falls back to `http://localhost:5197`.

---

## 7. Session / Timer Flow (End-to-End)

```
PLAN    SchedulePage
        ├── addTask()       → POST /api/planner/user/1/tasks    (creates "Pending" task)
        ├── editTask()      → PUT  /api/planner/tasks/{id}
        └── deleteTask()    → DELETE /api/planner/tasks/{id}
        └── "Ready to Focus" button → navigate("/sessions")

EXECUTE  SessionsPage
        ├── On mount: load sessions + tasks (filtered: status ≠ "Completed")
        ├── User selects tasks from TaskSelector
        ├── handleStartSession()
        │     ├── POST /api/sessions              → creates session (breakCount=0)
        │     └── POST /api/sessions/{id}/tasks   → links selected tasks to session
        │
        └── SessionTimer (countdown, pause/resume, task checkboxes)
              ├── onTaskToggle → PUT /api/planner/tasks/{id}  (toggle InProgress/Completed)
              └── "End Session" → calls onEnd({ duration })
                    └── handleEndSession() → sets sessionDuration, opens EvaluationModal

EVALUATE  EvaluationModal (mood picker + breaks skipped)
        └── handleSubmitEvaluation()
              ├── PATCH /api/sessions/{id}/times  → persists startTime, endTime, duration
              └── POST  /api/burnout              → saves burnout score
                    └── Score map: Happy→20, Neutral→50, Tired→80, Exhausted→100
              └── navigate("/dashboard")

REFLECT  DashboardPage
        ├── getSessionsByUser(1)     → compute total study hours + chart data
        ├── getTasksByUser(1)        → count completed tasks, build milestones
        ├── getPlannerByUser(1)      → show recommended load in StatusBanner
        └── getLatestBurnoutByUser(1)→ BurnoutRiskGauge, KPI mood, status banner
```

---

## 8. Burnout Algorithm

Defined in `BurnoutCalculator.cs`:

```
score = durationFactor + breakPenalty + moodPenalty
      = (studyDuration / 60 × 15)
      + max(0, (studyDuration/45 - breakCount) × 10)   ← break deficit penalty
      + moodPenalty (Happy=0, Neutral=10, Tired=30, Exhausted=60)

capped at 100.
```

Level thresholds:
- `< 40` → **Stable / Safe**
- `40–74` → **Warning**
- `≥ 75` → **Critical / High Risk**

**Current gap:** The frontend simplifies this by mapping mood strings directly to fixed scores (`Happy→20, Neutral→50, ...`) and sends only `score` to the backend. The `BurnoutCalculator.calculateScore()` method on the backend is not called during the actual session end flow — the score arrives pre-computed from the frontend.

---

## 9. Planner Adaptive Scheduling Logic

`StudyPlanner.adjustSchedule(score)`:
- `score < 40` → `recommendedLoad = 100%` (Normal)
- `score < 75` → `recommendedLoad = 60%` (Reduced)
- `score ≥ 75` → `recommendedLoad = 30%` (Minimal)

`StudyPlannerService.GetPlannerByUserAsync()` fetches the latest burnout record and runs `adjustSchedule()` before returning — meaning the recommended load is **dynamically computed** on each GET, not purely stored.

---


