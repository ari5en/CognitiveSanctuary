# System Current State Summary

## 1. Backend Architecture
The backend is built using **ASP.NET Core** following a clean, UML-aligned and minimal service-oriented structure.

### Core Controllers
- **SessionsController**: Handles session creation and basic updates (start time, end time, task linking).
- **PlannerController**: Handles task creation and retrieval for user planning.
- **BurnoutController**: Handles saving and retrieving burnout records.

### Service Layer
- Acts as a **thin wrapper over Supabase REST API** using `HttpClient`.
- Responsibilities are limited to basic **CRUD operations only**.
- All advanced logic such as session recovery, dashboard aggregation, and strict workflow validation has been removed to maintain academic simplicity.
- Backend now focuses purely on **data persistence and retrieval aligned with UML models**.

---

## 2. Frontend Architecture
The frontend is a **React-based application** responsible for managing the user workflow.

### Key Pages
1. **Schedule Page (Planning)**  
   Users create and manage tasks.

2. **Sessions Page (Execution)**  
   Users select tasks and run a focus session using a timer.

3. **Dashboard Page (Overview)**  
   Displays separate API-driven data such as sessions, tasks, and burnout records.

### Responsibility
- Frontend handles **application flow and user state**
- Backend provides **data endpoints only**
- No centralized backend orchestration is used

---

## 3. OOP / UML Alignment
The system directly follows the UML design with a simplified mapping approach.

### Core Models
- **StudySession**: Represents a single focus session record.
- **StudyTask**: Represents user-defined tasks.
- **User**: Base entity for ownership of data.
- **BurnoutCalculator (conceptual model)**: Used as reference for burnout scoring logic (kept minimal in implementation).

### Mapping Principle
Each UML class corresponds to a backend model structure, but logic is intentionally kept minimal to preserve clarity and academic readability.

---

## 4. System Flow (End-to-End)
1. **Plan**: User creates tasks in Schedule Page (stored in Supabase).
2. **Execute**: User starts a session and selects tasks.
3. **Track**: Session time and task updates are stored via API calls.
4. **Log**: Burnout record is saved after session completion.
5. **Review**: Dashboard fetches data from multiple endpoints for display.

---

## 5. Current Design Philosophy
The system prioritizes:
- **Simplicity over complexity**
- **UML alignment over production-level optimization**
- **Clear separation between frontend (flow) and backend (data layer)**

The backend is intentionally minimal and serves only as a **data persistence layer**, while the frontend manages the application behavior and user experience.