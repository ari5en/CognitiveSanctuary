    # Cognitive Sanctuary - Backend Integration Guide

## Purpose

This document is the shared guide for backend setup, integration, and coordination. It aligns Phase 1 (initialization) with the broader workflow and keeps teammates synchronized as the C# backend and React frontend are connected.

---

## Phase 1 - Backend Project Initialization

### Objective

Set up the ASP.NET Core Web API project and establish a clean backend structure that supports OOP-aligned development.

### Tasks

- Initialize ASP.NET Core Web API project
- Configure project structure
- Set up controllers, services, and models
- Implement basic API endpoints (health check or placeholder)
- Establish database connection (placeholder or actual)
- Decide on PostgreSQL or Supabase

### Suggested Backend Structure

Backend/
├── Controllers
├── Services
├── Models
├── DTOs
├── Data
└── Program.cs

### Phase 1 Checklist

- Project created with `dotnet new webapi`
- Folder structure created
- Base controller added (example: HealthController)
- Service layer stub created
- Models folder created with initial classes or placeholders
- Database config placeholder added (appsettings.json)

---

## Coordination Notes

- Backend should follow OOP design from UML.
- Frontend will remain on mock data until Phase 5.
- Each backend change should be documented here for the team.

---

## Next Phases (Preview)

### Phase 2 - Core OOP Class Implementation

Implement the core domain classes required by the UML:

- User
- StudySession
- StudyTask
- FocusSession
- BreakSession
- BurnoutCalculator
- StudyPlanner

Important:

- Use UML naming and types exactly (no Guid, no TimeSpan, no enterprise abstractions).

### Phase 3 - Service Layer Implementation

- Implement the business logic layer (services) to orchestrate model behavior.
- Keep controllers thin; services handle study sessions, burnout scoring, and planning.

### Phase 4 - Database Integration

- Configure Entity Framework Core
- Implement migrations
- Create schema based on models

### Phase 5 - API Development

- Build REST endpoints for auth, sessions, planner, and burnout monitoring

### Phase 6 - Frontend Integration

- Replace `mockData.js`
- Connect pages with backend APIs

---

## Ownership

- Backend + system integration: Georgie
- Frontend integration and UI: Frontend team

---

## Notes Log

- (Add dated updates here as the backend progresses)
