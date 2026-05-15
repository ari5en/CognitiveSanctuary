# Frontend System State (Current)

## 1. System Overview

The frontend is a planner-driven study system with three main surfaces:

- Planner-driven schedule (SchedulePage) that lists planned StudySessions from the backend planner and allows session-scoped task entry.
- Session execution (SessionsPage) that runs a focus and break cycle for a selected session and completes it through the backend.
- Dashboard analytics (DashboardPage) that summarizes planner mode, burnout state, session progress, and the next planned session.

Data flow is API-driven:

- Planner state and planned sessions are loaded from the backend and rendered directly in the SchedulePage UI.
- SessionsPage reads a sessionId from the URL, fetches the session, runs a local focus/break cycle, and completes the session via the backend.
- DashboardPage pulls planner, burnout, and sessions to display current system state.

The frontend does not compute burnout scores. It sends mood and breaksSkipped only, and the backend returns the evaluated burnout state.

## 2. Pages Inventory

### DashboardPage

- Purpose: Real-time system state overview for planner mode, burnout score, session progress, and the next planned session.
- Data consumed:
  - GET /api/planner/user/{userId}
  - GET /api/burnout/user/{userId}
  - GET /api/sessions/user/{userId}
  - GET /api/sessions/{sessionId}/tasks (for the next planned session task count)
- Key components used:
  - DashboardHeader
  - StatusBanner
  - KPICards
  - BurnoutRiskGauge
  - QuickActions
  - Card
- User actions:
  - Navigate to SchedulePage (Plan New Session)
  - Navigate to SessionsPage (View Sessions)

### SchedulePage

- Purpose: Planner-driven session dashboard showing planned sessions and session-scoped task entry.
- Data consumed:
  - GET /api/planner/user/{userId}
  - GET /api/sessions/user/{userId}
  - GET /api/sessions/{sessionId}/tasks
- Key components used:
  - ScheduleHeader
  - Card
  - Button
- User actions:
  - Generate Session (POST /api/planner/user/{userId}/sessions)
  - Add task to a session (POST /api/sessions/{sessionId}/tasks)
  - Start Session (navigate to /sessions?sessionId={id})

### SessionsPage

- Purpose: Structured session execution using the Focus -> Break Prompt -> Break cycle, then evaluation and completion.
- Data consumed:
  - GET /api/sessions/user/{userId}
  - PATCH /api/sessions/{id}/complete
- Key components used:
  - SessionHeader
  - MentalStateSelector
  - Card
  - Button
- User actions:
  - Run focus timer
  - Take break / Skip break
  - End session
  - Submit evaluation (mood only) to complete the session

## 3. Components Inventory

### A. Dashboard Components

- StatusBanner: Color-coded banner using planner burnoutMode (Normal, Warning, Recovery) with an icon and message.
- BurnoutRiskGauge: Semi-circle gauge rendered with Recharts using the latest backend burnout score and level.
- KPICards: Three KPI cards (total study time, sessions completed, burnout score) with icons.
- QuickActions: Two cards for navigation actions (plan new session, view sessions).
- FocusFlowChart: Recharts bar chart for focus flow (component exists, currently not used on DashboardPage).
- Milestones: List-style milestone cards (component exists, currently not used on DashboardPage).

### B. Schedule Components

- ScheduleHeader: Title/description header with optional error message.
- SessionCard: Not a standalone component. Session cards are rendered inline inside SchedulePage using Card and Button.
- AlertBanner: Legacy task-centric alert banner (component exists, not used on SchedulePage).

Additional schedule components present but unused in current SchedulePage:

- PriorityFocus
- RestMode
- FocusResilience
- DailyReflection

### C. Sessions Components

- SessionTimer: Legacy single timer component (exists but not used in current SessionsPage).
- BreakModal: Not implemented as a standalone component. Break prompt is inline in SessionsPage.
- EvaluationModal: Implemented inline inside SessionsPage (not a separate component file).
- MentalStateSelector: Mood picker with four states (1-4) used in EvaluationModal.
- SessionHeader: Session page header with optional message/error.

Other session components present but unused in current SessionsPage:

- BurnoutPrediction
- RecentSessions
- NumberInput
- SessionStats
- TaskSelector
- TriviaCard

## 4. State Management Flow

- sessionId is passed via query string: /sessions?sessionId={id}. SessionsPage parses it and finds the matching session from GET /api/sessions/user/{userId}.
- Planner state is fetched on SchedulePage and DashboardPage via GET /api/planner/user/{userId}.
- Burnout is computed only on the backend. SessionsPage sends mood and breaksSkipped through PATCH /api/sessions/{id}/complete.
- Session completion includes startTime, endTime, studyDuration, mood, breaksSkipped. The backend returns burnout and updates the planner.

## 5. User Flow (Critical)

1. Generate Session (SchedulePage)
   - User clicks Generate Session -> POST /api/planner/user/{userId}/sessions
   - Planned sessions list refreshes

2. Start Session (SchedulePage)
   - User clicks Start Session on a session card
   - Navigates to /sessions?sessionId={id}

3. Focus -> Break -> Evaluation (SessionsPage)
   - Focus timer starts using plannedFocusDuration
   - On completion -> Break Prompt
   - Take Break -> Break timer using plannedBreakDuration
   - Skip Break -> increments breaksSkipped and returns to focus
   - User ends session -> Evaluation modal (mood only)

4. Complete Session (SessionsPage)
   - PATCH /api/sessions/{id}/complete with startTime, endTime, studyDuration, mood, breaksSkipped
   - Backend computes burnout and updates planner
   - Redirect to DashboardPage

5. Burnout update (DashboardPage)
   - GET /api/burnout/user/{userId} updates burnout gauge
   - GET /api/planner/user/{userId} updates mode banner and planned config

## 6. Design System Notes (For Google Stitch)

- Card-based layout: Most sections are Card components with rounded corners and soft shadows.
- Modal usage: Evaluation modal in SessionsPage uses a centered overlay with framer-motion transitions.
- Timer-driven UX: Focus and break timers are large, centered, and show progress bars.
- Status color system:
  - Normal: green banner
  - Warning: amber banner
  - Recovery: red banner
- Session-centric UX: Session cards, timers, and completion flows are based on sessions, not standalone tasks.

## 7. Constraints (Do Not Break These)

- No standalone tasks outside sessions; tasks are created only within a session.
- No manual burnout scoring; burnout is computed on the backend only.
- No ad-hoc session creation outside the planner; sessions are generated through the planner endpoint.
- Planner always controls session structure (planned focus duration, break interval, break duration).
