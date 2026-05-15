# Cognitive Sanctuary — Backend Architecture
### How the Backend Folders Work Together

---

## The Big Picture: Request Flow

```
React Frontend (Browser)
        │
        │  HTTP Request (JSON)
        ▼
┌─────────────────┐
│   Controllers   │  ← Entry point. Receives all HTTP requests.
└────────┬────────┘
         │ calls
         ▼
┌─────────────────┐     uses     ┌─────────────────┐
│    Services     │ ────────────►│     Models      │
│  (+ Interfaces) │              │  (OOP Classes)  │
└────────┬────────┘              └─────────────────┘
         │ reads input from
         ▼
┌─────────────────┐
│      DTOs       │  ← Defines the shape of incoming/outgoing JSON
└─────────────────┘
         │
         │  HTTP (REST)
         ▼
┌─────────────────┐
│    Supabase     │  ← Cloud database (PostgreSQL)
│   (Database)    │
└─────────────────┘
```

---

## Folder-by-Folder Breakdown

---

### 📁 `Models/` — The OOP Core
> **This is the heart of the OOP requirement for your school project.**

This folder contains all the **C# classes** that represent real-world entities in the system. Every object in the system — a user, a study session, a task — is first defined here as a class with properties and behaviors.

| File | What it represents |
|---|---|
| `User.cs` | A registered student/user of the app |
| `StudySession.cs` | A single timed study block |
| `StudyTask.cs` | An individual task inside a session |
| `StudyPlanner.cs` | The user's smart adaptive planner |
| `FocusSession.cs` | A focused work block within a session |
| `BreakSession.cs` | A break block within a session |
| `BurnoutCalculator.cs` | OOP class that computes the burnout score from mood + behavior |
| `AdaptiveSessionConfig.cs` | Holds the auto-adjusted focus/break timing configuration |

**OOP Concepts Applied Here:**
- **Encapsulation** — each class bundles its own data (properties) and behavior (methods) together
- **Inheritance** — `FocusSession` and `BreakSession` both represent types of time blocks within a session
- **Abstraction** — complex logic like burnout scoring is hidden inside `BurnoutCalculator`, callers just call `.CalculateScore()`

---

### 📁 `Services/` — The Business Logic Brain
> **Where all the smart decisions happen.**

Services are responsible for all the real work — fetching data, applying rules, saving results. They sit between Controllers (who receive requests) and the Database (Supabase).

**Each service has TWO files:**
- `Interface____Service.cs` — the **contract** (defines what methods must exist)
- `____Service.cs` — the **implementation** (the actual code)

This is a classic OOP pattern called **Interface + Implementation**, which enforces abstraction and makes the system testable.

| File | What it does |
|---|---|
| `InterfaceStudySessionService.cs` | Declares methods: create session, complete session, get tasks, etc. |
| `StudySessionService.cs` | Implements all those methods, talks to Supabase |
| `InterfaceStudyPlannerService.cs` | Declares: create planner, adjust schedule, save planner |
| `StudyPlannerService.cs` | Implements adaptive scheduling — adjusts focus/break times based on burnout score |
| `InterfaceBurnoutService.cs` | Declares: save burnout record, get latest score |
| `BurnoutService.cs` | Implements burnout record saving and retrieval from database |
| `AnalyticsSummary.cs` | A helper class that aggregates dashboard statistics (study hours, streaks, session counts) |

**OOP Concepts Applied Here:**
- **Polymorphism** — Controllers only know the Interface type. The real implementation can be swapped without touching the controller.
- **Dependency Injection** — .NET automatically injects the right service where needed via `Program.cs`

---

### 📁 `DTOs/` — The Data Transfer Contracts
> **DTOs = Data Transfer Objects. They define exactly what JSON the frontend sends and receives.**

When the React frontend sends a POST request with a body like `{ "mood": 2, "studyDuration": 45 }`, the backend needs a matching C# class to parse it. That's a DTO.

| File | Used when |
|---|---|
| `SessionCreateRequest.cs` | Frontend creates a new study session |
| `SessionCompleteRequest.cs` | Frontend submits mood + timing after finishing a session |
| `SessionTimesUpdateRequest.cs` | Frontend updates start/end times of a session |
| `TaskCreateRequest.cs` | Frontend adds a new task to a session |
| `PlannerCreateRequest.cs` | Frontend initializes or updates the planner |
| `BurnoutRecordRequest.cs` | Frontend directly submits a burnout record |

**Why DTOs are important:**
- They prevent the frontend from accidentally sending extra/missing fields
- They separate the "API shape" from the internal Model shape — the backend can evolve internally without breaking the frontend contract
- They keep Controllers clean — instead of reading raw JSON, controllers receive a fully-typed C# object

---

### 📁 `Controllers/` — The Entry Point (API Endpoints)
> **Controllers are the "front door" of the backend. They receive HTTP requests and send back HTTP responses.**

Every URL your frontend calls (`/api/sessions`, `/api/planner/user/123`, etc.) is defined and handled inside a Controller. Controllers are kept intentionally thin — they receive the request, validate it, hand it to a Service, and return the result.

| File | API Routes it handles |
|---|---|
| `SessionsController.cs` | `GET/POST /api/sessions`, `PATCH /api/sessions/{id}/complete` |
| `PlannerController.cs` | `GET /api/planner/user/{id}`, `POST /api/planner/user/{id}/sessions` |
| `BurnoutController.cs` | `POST /api/burnout`, `GET /api/burnout/user/{id}` |
| `AnalyticsController.cs` | `GET /api/analytics/user/{id}` — returns dashboard stats |
| `HealthController.cs` | `GET /api/health` — simple ping to check if backend is alive |

**OOP Concepts Applied Here:**
- Each Controller is a **class** that groups related routes together (Single Responsibility Principle)
- Controllers use **constructor injection** to receive their Service dependency — they never create service instances themselves

---

### 📁 `Properties/` — Launch & Environment Config
> **Not business logic — just configuration for how the app starts up.**

Contains `launchSettings.json` which defines:
- Which port the backend runs on (port `5197`)
- Environment variables for development mode
- App URL settings

---

### 📄 `Program.cs` — The Startup Orchestrator
> **The single file that wires everything together when the app boots.**

This file is the backend's "main function." It:
1. Reads environment variables from `.env` (Supabase URL + API key)
2. Registers all Services into the **Dependency Injection container** so .NET knows which Interface maps to which Implementation
3. Configures **CORS** (Cross-Origin Resource Sharing) so the React frontend on port `5173` is allowed to talk to the backend on port `5197`
4. Sets up the **HTTP pipeline** (middleware order: CORS → routing → controllers)

---

## How Frontend ↔ Backend Communicate

```
React Frontend (port 5173)
          │
          │  fetch("http://localhost:5197/api/sessions", { method: "POST", body: JSON })
          │
          ▼
  SessionsController.cs
     receives JSON → parses it into SessionCreateRequest DTO
          │
          ▼
  StudySessionService.cs
     applies business logic, calls StudyPlanner, BurnoutCalculator
          │
          ▼
  Supabase REST API (Cloud DB)
     saves/retrieves data
          │
          ▼
  Service returns result to Controller
          │
          ▼
  Controller returns HTTP 200 OK + JSON response
          │
          ▼
React Frontend
     reads JSON response, updates UI state
```

**Key Protocol Details:**
- All communication is over **HTTP/JSON** — both sides agree on the same JSON shape (enforced by DTOs)
- The frontend uses `api.js` as a single service layer — all `fetch()` calls are centralized there
- The backend uses the **Supabase REST API** (not a direct DB driver) to talk to the PostgreSQL database — this means the backend itself is also a "frontend" to Supabase

---

## Summary: Dependency Chain

```
Program.cs
  └── registers Services into DI container
        │
        ▼
Controllers  (receive HTTP, call Services via Interface)
  └── use DTOs to parse incoming JSON
        │
        ▼
Services  (implement Interfaces, contain business logic)
  └── instantiate and use Models (OOP classes)
  └── call Supabase REST API to persist/retrieve data
        │
        ▼
Models  (pure OOP — data + behavior, no DB calls)
  └── BurnoutCalculator, StudyPlanner, StudySession, etc.
```

> **One-line version:** *The frontend sends JSON → Controller parses it with a DTO → Service processes it using OOP Models → Result is saved to Supabase → JSON response goes back to the frontend.*
