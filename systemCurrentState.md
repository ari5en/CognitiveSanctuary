# System Current State Summary

## 1. Backend Architecture
The backend is built using **ASP.NET Core** and follows a modular, service-oriented architecture designed for academic clarity and strict adherence to OOP principles.

### Core Controllers
- **SessionsController**: Manages focus session lifecycles (Creation, Start/End Time updates, and task linking).
- **PlannerController**: Handles the planning phase, specifically task creation and management.
- **BurnoutController**: Manages mental state records and burnout risk scores.

### Service Layer
- **Role**: Thin abstraction layer between the controllers and the Supabase database.
- **Implementation**: Services (e.g., `StudySessionService`) use `HttpClient` to communicate with the Supabase REST API. 
- **Simplification**: All "production-heavy" features like state recovery engines, dashboard aggregation, and complex backend validation workflows have been removed. The services now focus on clean CRUD operations and essential domain logic.

---

## 2. Frontend Architecture
The frontend is a **React** application designed to act as the primary workflow orchestrator.

### Key Pages & Workflow
1. **Schedule (Planning)**: Users define their tasks and priorities.
2. **Sessions (Execution)**: Users select tasks from their plan and run a focus timer.
3. **Dashboard (Analytics)**: Users view their focus hours, task completion metrics, and burnout risk levels.

### Responsibility
- **Frontend as Orchestrator**: The frontend is responsible for the session flow and state handling.
- **Consolidation**: Instead of relying on "Smart API" endpoints, the frontend performs modular calls to different domain controllers (e.g., fetching sessions and burnout records separately) to display the dashboard.

---

## 3. OOP / UML Alignment
The system implementation is a direct reflection of the project's **UML Class Diagram**.

### Core Models
- **StudySession**: Tracks the duration, breaks, and timing of a focus block.
- **StudyTask**: Represents individual units of work linked to a user or session.
- **BurnoutCalculator**: Encapsulates the logic for determining burnout risk based on user sessions and mental states.
- **User**: The root entity for all data associations.

### Behavior Mapping
- Every class in the UML corresponds to a model in the backend and a domain in the service layer, ensuring a 1:1 mapping between the design documentation and the actual code.

---

## 4. System Flow (End-to-End)
1. **Plan**: User adds tasks in the **Schedule Page** (saved as `Pending` tasks).
2. **Execute**: User enters the **Sessions Page**, selects specific tasks, and starts the timer.
3. **Update**: During the session, tasks can be marked as `Completed` via a `PATCH` request.
4. **Log**: Ending the session triggers the creation of a **Burnout Record** based on the session's intensity and the user's reported mental state.
5. **Review**: The **Dashboard** aggregates these records to provide a visual summary of productivity and health.

---

## 5. Current Design Philosophy
The system prioritizes **Simplicity** and **Separation of Concerns**:
- **Backend**: Serves as a reliable, UML-aligned data layer.
- **Frontend**: Serves as the dynamic orchestrator of user experience and business flow.
- **Academic Alignment**: The architecture is optimized for clarity, making it easy to explain the relationship between OOP models and web application behavior.


