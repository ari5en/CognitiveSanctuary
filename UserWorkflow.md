# Correct User Workflow (Cognitive Sanctuary)

## 1️⃣ Dashboard (Entry Point)

The user arrives in the system.

### Shows:
- Current productivity stats
- Burnout risk
- Study hours
- Today's sessions

### Goal:
Provide a quick overview of the user's mental state and productivity.

---

## 2️⃣ Schedule / Planner Page

The user plans their tasks for the day.

### Actions:
- Add tasks
- Set task priority
- View recommended workload

### Backend:
- Data stored in `study_planner`
- Tasks linked later to sessions

### Goal:
Help the user decide what to work on for the day.

---

## 3️⃣ Sessions Page (Execution)

The user starts focused work sessions.

### Actions:
- Configure session duration
- Start session

### Backend Flow:
- Create `study_sessions`
- Attach tasks using:

```http
POST /api/sessions/{sessionId}/tasks
