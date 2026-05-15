# Updated Workflow Process (Backend + Frontend)

## Phase 1 — Backend Initialization

Set up the ASP.NET Core Web API project structure.

### Tasks
- Create the ASP.NET Core Web API project
- Configure:
  - Controllers
  - Services
  - Models
  - DTOs
  - Data folders
- Add a base health-check endpoint

---

## Phase 2 — Core OOP Model Implementation

Implement the UML-based core classes.

### Model Classes
- `User`
- `StudySession`
- `StudyTask`
- `FocusSession`
- `BreakSession`
- `BurnoutCalculator`
- `StudyPlanner`

### Requirements
- Follow UML naming and data types strictly
- Avoid enterprise abstractions
- Do not use:
  - `Guid`
  - `TimeSpan`
  - EF Core entities

---

## Phase 3 — Service Layer Implementation

Create the business logic layer.

### Tasks
- Create service interfaces and implementations
- Keep logic in-memory temporarily
- Maintain thin controllers

---

## Phase 4 — Supabase Database Integration

Connect the backend to Supabase REST APIs.

### Requirements
- Use:
  - `SUPABASE_URL`
  - `ANON_KEY`
- Avoid:
  - `EF Core`
  - `DbContext`

### Flow
Services communicate directly with Supabase REST endpoints.

---

## Phase 5 — API and DTO Implementation

Build the API endpoints and request/response models.

### Tasks
- Create controllers and DTOs
- Connect endpoints to services
- Return proper HTTP status codes

---

## Phase 6 — Frontend Integration

Connect the frontend to the backend APIs.

### Tasks
- Replace `mockData.js` with API calls
- Integrate:
  - Dashboard
  - Schedule page
  - Sessions page

---

## Phase 7 — Feature Expansion

Enhance system intelligence and usability.

### Planned Features
- Improved burnout analysis
- Adaptive scheduling logic

---

## Phase 8 — Testing and Stabilization

Finalize and optimize the system.

### Tasks
- Test API endpoints and frontend workflows
- Fix integration issues
- Optimize overall performance
