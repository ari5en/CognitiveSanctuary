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

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

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

export async function updateSessionTimes(sessionId, payload) {
  return request(`/api/sessions/${sessionId}/times`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function saveBurnoutRecord(payload) {
  return request("/api/burnout", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function savePlanner(payload) {
  return request("/api/planner", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getPlannerByUser(userId) {
  return request(`/api/planner/user/${userId}`);
}
