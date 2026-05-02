Plan: Phase 6 Frontend Integration

Goal

Replace mock data and connect the React frontend to the new backend API endpoints.

Steps

1. Create a small API client layer.
   - Centralize the base URL and fetch helpers.
   - Handle JSON parsing and basic errors.

2. Replace mockData usage in pages.
   - DashboardPage -> fetch burnout metrics and sessions data.
   - SchedulePage -> fetch planner/schedule data.
   - SessionsPage -> create and update study sessions.

3. Wire form actions to backend.
   - Login -> placeholder call (or defer until auth exists).
   - Session start/end -> POST/PATCH session endpoints.

4. Add loading and error states per page.
   - Show skeleton or fallback message.

5. Validate end-to-end flow.
   - Confirm UI updates after API responses.

Relevant files

- frontend/src/pages/DashboardPage.jsx
- frontend/src/pages/SchedulePage.jsx
- frontend/src/pages/SessionsPage.jsx
- frontend/src/data/mockData.js (remove usage or delete later)
- frontend/src/services/api.js (new)

Verification

- Frontend builds successfully.
- Pages load data from backend endpoints.
- No mockData imports remain in page files.

Decisions

- Keep UI logic simple and stable before expanding features.
- Avoid advanced state libraries until needed.

Implementation Log

Files added:

- frontend/src/services/api.js

Files updated:

- frontend/src/pages/DashboardPage.jsx
- frontend/src/pages/SchedulePage.jsx
- frontend/src/pages/SessionsPage.jsx
- phase6Implementation.md

Notes:

- Dashboard now reads backend sessions/planner data with fallback UI data.
- Schedule now reads planner/session data and adjusts the workload banner.
- Sessions now creates sessions from the backend and shows recent backend sessions.
- Login remains a placeholder until auth exists.
- Topbar now uses a local fallback avatar instead of mock data.

Validation Results

- Frontend build succeeded with `npm run build`.
- No `mockData` imports remain in the frontend page/component files that were part of Phase 6.
