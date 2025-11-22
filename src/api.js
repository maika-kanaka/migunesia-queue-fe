const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function request(path, { method = "GET", body, headers } = {}) {
  const url = `${API_BASE_URL}/api/v1${path}`;

  const options = {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  };

  const res = await fetch(url, options);

  let data = null;
  try {
    data = await res.json();
  } catch {
    // kalau backend tidak mengirim JSON (misal kosong), biarkan null
  }

  if (!res.ok) {
    const error = new Error("API Error");
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export function apiGet(path) {
  return request(path, { method: "GET" });
}

export function apiPost(path, body) {
  return request(path, { method: "POST", body });
}

export function apiPut(path, body) {
  return request(path, { method: "PUT", body });
}

export function apiDelete(path) {
  return request(path, { method: "DELETE" });
}
