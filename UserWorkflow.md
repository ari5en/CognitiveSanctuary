Correct User Workflow (Cognitive Sanctuary)
1️⃣ Dashboard (Entry Point)
User arrives in the system.
Shows:


Current productivity stats


Burnout risk


Study hours


Today's sessions


Goal:
Quick overview of mental state and productivity.

2️⃣ Schedule / Planner Page
User plans their tasks for the day.
Actions:


Add tasks


Set priority


See recommended workload


Backend:


stored in study_planner


tasks linked later to sessions


Goal:
Decide what to work on today.

3️⃣ Sessions Page (Execution)
User starts focused work.
Actions:


Configure session duration


Start session


Backend flow:


create study_sessions


attach tasks using
POST /api/sessions/{sessionId}/tasks


Goal:
Actual deep work execution.

4️⃣ During Session
System tracks:


session time


break usage


task progress



5️⃣ After Session
System records mental state.
Endpoint:
POST /api/burnout
Stored in:
burnout_records
Goal:
Measure burnout risk.

6️⃣ Feedback Loop
Next time user opens the app:
Dashboard + Schedule adjusts:


recommended workload


burnout indicator



Final Flow (Correct Order)
Dashboard   ↓Schedule / Planner (plan tasks)   ↓Sessions (start focused work)   ↓Session Tracking   ↓Burnout Analysis   ↓System adjusts next day's workload

✅ Conclusion:
Copilot's explanation is 80% correct, but the Dashboard should be the entry point, not the Schedule page.
