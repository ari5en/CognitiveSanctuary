Updated Workflow Process (Backend + Frontend)

Phase 1 - Backend Project Initialization

- Create ASP.NET Core Web API project
- Set up Controllers, Services, Models, DTOs, Data folders
- Add base health endpoint

Phase 2 - Core OOP Class Implementation (UML-Exact) (Model Files)

- Implement User, StudySession, StudyTask, FocusSession, BreakSession, BurnoutCalculator, StudyPlanner
- Follow UML naming/types strictly
- No Guid, no TimeSpan, no enterprise abstractions

Phase 3 - Service Layer Implementation (Service Files)

- Create service interfaces and implementations
- Keep in-memory logic for now
- Controllers should remain thin

Phase 4 - Database Integration (Supabase REST)

- Use SUPABASE_URL + ANON_KEY
- No EF Core or DbContext
- Services call Supabase REST endpoints

Phase 5 - API Implementation (DTO folders + Controller Folder)

- Create controllers and DTOs
- Wire endpoints to services
- Return proper status codes

Phase 6 - Frontend Integration

- Replace mockData.js with API calls
- Connect dashboard, schedule, sessions pages

Phase 7 - Feature Expansion

- Burnout analysis improvements
- Adaptive scheduling logic

Phase 8 - Testing and Stabilization

- Test endpoints and frontend flows
- Fix integration bugs
- Optimize performance
