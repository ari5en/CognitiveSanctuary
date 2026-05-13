const DEFAULT_BASE_URL = "http://localhost:5197";

const baseUrl = import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL;

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }

  const text = await response.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch (err) {
    return text;
  }
}

// ─── Sessions ────────────────────────────────────────────────────────────────

export async function getSessionsByUser(userId) {
  return request(`/api/sessions/user/${userId}`);
}

export async function createSession(payload) {
  return request("/api/sessions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function addTaskToSession(sessionId, payload) {
  return request(`/api/sessions/${sessionId}/tasks`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getTasksBySession(sessionId) {
  return request(`/api/sessions/${sessionId}/tasks`);
}

// ─── Session Completion (atomic — replaces updateSessionTimes + saveBurnoutRecord) ──

/**
 * Completes a session atomically:
 *   - Persists timing + mood + breaksSkipped
 *   - Backend computes burnout score via BurnoutCalculator (NOT pre-computed here)
 *   - Backend saves BurnoutRecord and updates StudyPlanner
 * Returns: { burnoutScore, burnoutLevel, adaptiveConfig }
 *
 * @param {number} sessionId
 * @param {{ startTime, endTime, studyDuration, mood, breaksSkipped }} payload
 *   mood: 1=Happy, 2=Neutral, 3=Tired, 4=Exhausted
 */
export async function completeSession(sessionId, payload) {
  return request(`/api/sessions/${sessionId}/complete`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

// Legacy — kept for backward compat, prefer completeSession() instead
export async function updateSessionTimes(sessionId, payload) {
  return request(`/api/sessions/${sessionId}/times`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

// ─── Planner ─────────────────────────────────────────────────────────────────

/**
 * StudyPlanner generates a new StudySession with the adaptive focus/break structure.
 * This is the correct entry point: StudyPlanner → StudySession.
 */
export async function generateSession(userId) {
  return request(`/api/planner/user/${userId}/sessions`, {
    method: "POST",
  });
}

export async function savePlanner(payload) {
  return request("/api/planner/user/1", {
    method: "POST",
    body: JSON.stringify({
      RecommendedLoad: payload.RecommendedLoad || payload.recommendedLoad,
    }),
  });
}

export async function getPlannerByUser(userId) {
  return request(`/api/planner/user/${userId}`);
}

export async function getTasksByUser(userId) {
  return request(`/api/planner/user/${userId}/tasks`);
}

export async function addTask(taskData) {
  return request(`/api/planner/user/1/tasks`, {
    method: "POST",
    body: JSON.stringify({
      Title: taskData.Title || taskData.title,
      EstimatedTime: taskData.EstimatedTime || taskData.estimated_time || 30,
    }),
  });
}

export async function updateTask(taskId, payload) {
  return request(`/api/planner/tasks/${taskId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteTask(taskId) {
  return request(`/api/planner/tasks/${taskId}`, {
    method: "DELETE",
  });
}

// ─── Burnout ─────────────────────────────────────────────────────────────────

/**
 * Direct burnout record save — score computed on the backend.
 * For full session completion, prefer completeSession() instead.
 * @param {{ sessionId, mood, breaksSkipped }} payload
 */
export async function saveBurnoutRecord(payload) {
  return request("/api/burnout", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getLatestBurnoutByUser(userId) {
  return request(`/api/burnout/user/${userId}`);
}

// ─── Analytics ────────────────────────────────────────────────────────────────

/**
 * Fetches the fully pre-aggregated dashboard analytics from the backend.
 * Replaces the three-call (sessions + tasks + burnout) pattern with a single request.
 * Backend computes: totalStudyHours, weekly buckets, averages, streak, task counts.
 * @param {number} userId
 */
export async function getDashboardAnalytics(userId) {
  return request(`/api/analytics/user/${userId}`);
}

