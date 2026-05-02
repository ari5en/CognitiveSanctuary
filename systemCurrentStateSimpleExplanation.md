# System Current State Summary

## 1. Backend Architecture
The backend is built using **ASP.NET Core** following a clean, UML-aligned and minimal service-oriented structure.

### Core Controllers
- **SessionsController**: Handles session creation and basic updates.
- **PlannerController**: Handles task creation using user-specific links (e.g., `/api/planner/user/1/tasks`).
- **BurnoutController**: Handles burnout records. It now gives a "Stable" starting point for new users so the dashboard always works without errors.

### Service Layer
- Acts as a **thin wrapper over Supabase**.
- It only handles basic **saving and getting of data**.
- All advanced features are handled by the frontend, keeping the backend simple and easy to understand for academic review.

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