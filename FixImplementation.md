We need to realign the system architecture and frontend behavior back to our original intended concept because the current implementation drifted into a task-based Pomodoro tracker instead of an adaptive study planner with burnout management.

Please treat this as the updated authoritative system direction and implementation context moving forward.

==================================================
ORIGINAL CORE SYSTEM CONCEPT
============================

The system is NOT just a CRUD task manager with a timer.

The intended concept is:

A smart adaptive study planner that:

* organizes study schedules
* manages structured StudySessions
* tracks user burnout
* adapts future schedules automatically based on burnout results

Core loop:
Plan → Study → Evaluate Burnout → Adapt Future Schedule

The system should be SESSION-CENTRIC, not TASK-CENTRIC.

==================================================
CORRECT OOP / DOMAIN STRUCTURE
==============================

User

* owns one StudyPlanner
* has multiple StudySessions

StudyPlanner

* generates and manages StudySessions
* adapts future StudySessions based on BurnoutCalculator results
* responsible for adaptive scheduling logic

StudySession

* represents one structured study block
* contains:

  * FocusSessions
  * BreakSessions
  * StudyTasks
* stores:

  * duration
  * mood
  * breaks skipped
  * burnout-related data

StudyTask

* individual activities inside a StudySession
* examples:

  * review notes
  * solve exercises
  * coding practice

FocusSession

* actual focused study period
* part of StudySession

BreakSession

* rest period between focus sessions
* part of StudySession
* automatically triggered after focus periods

BurnoutCalculator

* computes burnout score using:

  * study duration
  * skipped breaks
  * mood
* returns:

  * Low
  * Moderate
  * High burnout state

BurnoutRecord

* stores burnout history/results

==================================================
CURRENT SYSTEM PROBLEMS THAT MUST BE FIXED
==========================================

1. Schedule Page currently behaves like a CRUD StudyTask manager

---

CURRENT:

* tasks are created independently
* planner acts only as task storage

PROBLEM:
This breaks the intended hierarchy and adaptive scheduling architecture.

EXPECTED:
StudyPlanner must manage StudySessions first.
StudyTasks should exist INSIDE StudySessions.

Correct hierarchy:
StudyPlanner
↓
StudySessions
↓
StudyTasks

The planner page should display adaptive StudySession blocks/schedules, not only raw tasks.

==================================================

2. Sessions Page currently behaves like a Pomodoro timer

---

CURRENT:

* user selects tasks manually
* starts one generic timer

PROBLEM:
This ignores the intended FocusSession + BreakSession flow.

EXPECTED:
A StudySession should contain:

* alternating FocusSessions
* automatic BreakSessions
* StudyTasks

Correct behavior:
FocusSession starts
→ timer runs
→ FocusSession ends
→ BreakSession automatically starts/prompts
→ user may:

* take break
* skip break

Skipping breaks should increase burnout score.

The session flow must model:
Study → Break → Study → Break

instead of only running one timer.

==================================================

3. Adaptive Scheduling is not actually implemented

---

CURRENT:

* dashboard only displays burnout warning text
* no actual schedule adaptation happens

EXPECTED:
BurnoutCalculator results must automatically modify future StudySessions.

Examples:

LOW BURNOUT

* normal study load

MODERATE BURNOUT

* reduce session durations
* add more breaks
* remove one focus block

HIGH BURNOUT

* activate recovery mode
* add wellness/recovery sessions
* reduce workload heavily
* optionally block excessive studying temporarily

IMPORTANT:
The user should NOT manually adapt the schedule.
The system automatically updates future StudySessions through StudyPlanner.

==================================================

4. Dashboard currently does not reflect intended system state

---

CURRENT:

* some cards/charts are placeholders
* planner/session hierarchy not visible
* adaptive changes not visible

EXPECTED DASHBOARD FEATURES:

* burnout level/status
* today's adaptive study schedule
* progress tracking
* recent StudySessions
* burnout analytics
* adaptive notices
* session statistics
* focus/break summaries

Dashboard should visualize:

* StudyPlanner state
* StudySession progress
* Burnout adaptation results

==================================================

5. Planner and Session relationship is weak/missing

---

CURRENT:
Tasks are created first then manually selected into sessions.

EXPECTED:
StudyPlanner should generate/manage StudySessions directly.

Flow should become:
StudyPlanner
→ creates StudySessions
→ sessions contain StudyTasks
→ user executes StudySession
→ BurnoutCalculator evaluates session
→ StudyPlanner adapts future sessions

NOT:
Tasks → select tasks → generic timer

==================================================

6. Missing burnout intervention features

---

NOT YET IMPLEMENTED:

* high burnout modal
* recovery/wellness intervention
* adaptive recovery blocks

EXPECTED:
When burnout is HIGH:

* show wellness modal/intervention
* recommend recovery
* optionally lock/reduce excessive study sessions temporarily

==================================================
IMPORTANT IMPLEMENTATION DIRECTION
==================================

DO NOT rewrite the entire system from scratch.

KEEP:

* existing timer foundation
* burnout calculation logic
* dashboard foundation
* database integration
* task tracking system

REFACTOR:

* architecture
* relationships
* planner/session flow
* adaptive scheduling behavior

The system should transition from:
TASK-CENTRIC
to:
SESSION-CENTRIC + ADAPTIVE

==================================================
TARGET PAGE RESPONSIBILITIES
============================

Schedule / StudyPlanner Page

* displays adaptive StudySessions
* manages schedules
* shows focus/break structure
* displays adaptive modifications

StudySession Page

* executes one StudySession
* handles FocusSession + BreakSession flow
* tracks tasks during execution
* tracks skipped breaks and mood

Dashboard

* reflects planner/session/burnout state
* shows adaptive scheduling effects
* visualizes burnout metrics

Burnout History / Analytics

* future implementation
* historical burnout trends
* workload analysis

Before implementing anything, first map the current codebase architecture to the intended architecture described below.

Identify:

* reusable components/services
* architectural mismatches
* required refactors
* affected pages/components
* database/schema implications
* frontend/backend responsibilities

Prioritize incremental refactoring over full rewrites whenever possible.

After analysis, produce:
1. Refactor roadmap
2. Proposed architecture changes
3. Component/page mapping
4. Backend/API changes
5. Database/schema recommendations
6. Incremental implementation order 


==================================================
FINAL IMPORTANT NOTE
====================

Please realign all future implementations, refactors, components, and architecture decisions to this intended adaptive study planner concept and avoid drifting back into a simple Pomodoro/task-tracker architecture.

