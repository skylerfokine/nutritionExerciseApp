// Centralized fetch helper for your React app.
// - Automatically sends cookies (session) with every request.
// - Reads base URL from Vite env (VITE_API_URL).
// - Adds JSON headers when sending a body.
// - Throws rich errors with { status, data } so callers can show messages.

const BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, ""); // trim trailing slash

function toQuery(params = {}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

export async function api(path, opts = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    query, // object → ?a=1&b=2
    signal, // optional AbortSignal
  } = opts;

  if (!BASE) {
    console.warn("VITE_API_URL is not set; requests will be relative.");
  }

  const url = `${BASE}${path}${toQuery(query)}`;

  const init = {
    method,
    credentials: "include", // send cookies!
    headers: { ...headers },
    signal,
  };

  // If we pass a JS object as body, JSON-encode it and set header
  if (body !== undefined) {
    if (typeof body === "object" && !(body instanceof FormData)) {
      init.headers["Content-Type"] =
        init.headers["Content-Type"] || "application/json";
      init.body = JSON.stringify(body);
    } else {
      // Allow FormData / raw strings if caller supplied them
      init.body = body;
    }
  }

  const res = await fetch(url, init);

  // Try to parse JSON if server says it's JSON; otherwise read text
  const ctype = res.headers.get("content-type") || "";
  const isJSON = ctype.includes("application/json");
  const payload = isJSON
    ? await res.json().catch(() => ({}))
    : await res.text();

  if (!res.ok) {
    const err = new Error((payload && payload.message) || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = payload;
    throw err;
  }

  return payload;
}

// Convenience wrappers
export const apiGet = (path, query) => api(path, { method: "GET", query });

export const apiPost = (path, body) => api(path, { method: "POST", body });

export const apiPatch = (path, body) => api(path, { method: "PATCH", body });

export const apiDelete = (path) => api(path, { method: "DELETE" });

/* ===== Example usage (remove after wiring) =====
import { apiGet, apiPost } from './lib/api';

// Login:
await apiPost('/auth/login', { email, password });

// Who am I:
const me = await apiGet('/auth/me');

// Search foods:
const foods = await apiGet('/foods', { search: 'chicken', limit: 5 });

// Add a food log:
await apiPost('/foods/logs', { foodId: 123, quantity: 1.5, logDate: '2025-12-01' });
================================================= */
