Here is the **fully updated and cleaned markdown (with your Phase 5 + backend integration + UX evolution properly merged, no conceptual drift, and aligned to your unified adaptive interface direction).**

You can directly copy-paste this into `migrationSPA_roadmap.md`.

---

# Unified Adaptive Interface Roadmap (Backend-Driven)

This system is a **single continuous adaptive interface (cognitive dashboard canvas)**.

It is NOT:

* a multi-page app compressed into one view
* a section-based navigation system
* a scroll-based UI layout pretending to be pages
* a frontend-driven execution system

The frontend is ONLY a reactive visualization layer over backend state.

---

# 🧠 Core System Rule (Non-Negotiable)

## Backend owns EVERYTHING:

* session lifecycle
* timing structure
* burnout computation
* planner adaptation

## Frontend does NOT:

* simulate execution
* compute timing or burnout
* manage lifecycle transitions
* implement navigation logic
* introduce layout mode switching

---

# 🧩 UI Structure (Unified Canvas Model)

> IMPORTANT: These are NOT “sections as pages”.
> They are **continuous canvas layers in a single system view**.

```
SinglePageHome (continuous adaptive canvas)

├── Dashboard Canvas Layer (always visible data block)
│   ├── StatusBanner
│   ├── KPICards
│   ├── BurnoutRiskGauge
│   └── QuickActions
│
├── Planner Canvas Layer (always visible data block)
│   ├── PlannerBanner
│   ├── Generate Session action
│   └── SessionCards (backend-generated data stream)
│
├── Session Stream (rendered data feed inside canvas)
│   └── Live session previews tied to backend planner output
│
└── Timer Overlay (conditional overlay only)
    └── Render-only execution display
```

---

# 📦 Frontend State Model (STRICT MINIMAL STATE)

Only UI orchestration state is allowed:

```js
{
  planner,
  sessions,
  selectedSessionId,   // preview only (UI selection)
  activeSessionId      // triggers overlay only (execution display trigger)
}
```

---

# 🚫 What the Frontend MUST NEVER CONTAIN

* session lifecycle logic
* timing engines
* burnout computation
* execution simulation
* navigation state machines
* layout mode switching logic
* conditional “page-like UI states”
* uiView or any routing-derived UI state

---

# ⚙️ Execution Architecture (STRICT SEPARATION)

```
UI Layer:
SinglePageHome (visualization only)

Execution Layer:
useSessionExecutionEngine()

Backend Layer:
StudySessionService
BurnoutService
StudyPlannerService
```

---

# 🔌 Phase 5 — Backend Integration Layer (CRITICAL MISSING FOUNDATION)

## Goal:

Convert static UI into a **fully backend-driven reactive system**

---

## 5.1 Replace ALL static data sources

Remove:

* mock sessionItems
* mock dashboardKpis
* mock burnoutRisk
* any hardcoded planner/session values

Replace with:

* backend API responses only

---

## 5.2 Introduce unified data layer

Create a single source of truth hook:

```js
useCognitiveDashboardState()
```

Responsibilities:

* fetch planner state from backend
* fetch session stream
* fetch dashboard metrics
* synchronize all UI layers

---

## 5.3 Reactive synchronization

Each canvas layer becomes backend-driven:

* Dashboard → backend metrics
* Planner → backend planner state
* Session Stream → backend session list
* Timer → backend execution state

---

# ⚙️ Phase 5.5 — Execution Engine Integration

Connect:

```js
useSessionExecutionEngine()
```

To:

* activeSessionId
* backend session state updates

## Rules:

* UI does NOT control execution
* engine reacts to backend state
* engine does NOT own UI state

---

# 🎯 FINAL ARCHITECTURE INTENT

This system is:

> a backend-orchestrated adaptive cognitive interface (live system state canvas)

NOT:

* a SPA
* a scroll-based dashboard
* a navigation system
* a frontend execution system

---

# 🚀 MIGRATION PLAN (UPDATED)

## Phase 1 — Unified Canvas Setup

* Create SinglePageHome
* Render all layers simultaneously
* No navigation logic
* Keep legacy pages intact

---

## Phase 2 — Dashboard Layer Integration

* Replace static dashboard with backend-driven data
* Always visible canvas layer
* No logic changes

---

## Phase 3 — Planner Layer Integration

* Replace static planner with backend-driven planner state
* Session generation remains backend-owned

---

## Phase 4 — Session Stream Integration

* Sessions rendered as passive backend stream
* No control logic allowed in UI

---

## Phase 5 — Backend Integration Layer (NEW CRITICAL PHASE)

* Replace ALL mocks with API-driven state
* Introduce `useCognitiveDashboardState()`
* Sync all layers to backend

---

## Phase 6 — Timer Overlay Integration

* Timer becomes overlay-only visualization
* Controlled by `activeSessionId`
* Execution handled by `useSessionExecutionEngine()`

---

## Phase 7 — UX Evolution (NON-FUNCTIONAL REFACTOR)

### Replace scroll-based layout with adaptive canvas behavior:

Instead of:

* vertical stacked sections

Move toward:

* **adaptive focus-based UI system**

### Target UX behavior:

* Dashboard = pinned system state layer
* Planner = expandable control layer
* Session Stream = collapsible live feed
* Timer = floating overlay

### Principle:

> UI should feel like a **live cognitive system dashboard**, not a scroll page.

---

# ⚠️ RISK CONTROL

## API duplication risk

→ Centralize all API calls in `useCognitiveDashboardState`

## Timer coupling risk

→ Timer logic exists ONLY in execution engine

## UI drift back to navigation model

→ STRICT RULE: no layout switching logic allowed

## Session inconsistency risk

→

* selectedSessionId = preview only
* activeSessionId = execution only

---

# 🛟 SAFE ROLLBACK

* Keep multipage system untouched
* Unified interface exists only in `/home`
* Full rollback possible without backend changes

---

# 📌 SUCCESS CRITERIA

* No navigation logic anywhere in frontend
* All UI layers render from backend state
* Timer is overlay-only
* No lifecycle logic exists in frontend
* No duplicated execution logic
* UI behaves as a continuous adaptive system canvas

---

# 🧭 FINAL NOTE

This is no longer a “SPA migration”.

It is:

> **a backend-orchestrated adaptive cognitive system UI redesign**

---
    