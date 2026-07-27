// API client — the ONLY place the app calls `fetch` (SRS Appendix B.2).
//
// Talks to the FastAPI backend. Attaches the Supabase JWT on every request,
// unwraps the pagination envelope for list endpoints, and normalises errors
// (401/404/422/501) into a single ApiError shape the UI can act on.
import { getAccessToken } from './auth';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

// One error type the whole app can switch on: err.status + err.details.
export class ApiError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;      // HTTP status (0 = network/config failure)
    this.details = details;    // 422: [{ loc, msg, type }]
  }
}

async function request(path, { method = 'GET', body, params } = {}) {
  if (!BASE_URL) {
    throw new ApiError(0, 'API base URL is not configured (VITE_API_BASE_URL).');
  }

  const url = new URL(BASE_URL + path);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, v);
    }
  }

  const token = await getAccessToken();

  let res;
  try {
    res = await fetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        // The backend verifies this JWT via Supabase JWKS and enforces RBAC.
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Network error — could not reach the server.');
  }

  // Well-known statuses get intent-revealing messages.
  if (res.status === 401) {
    // Expired/invalid token. Callers (AppContext) treat this as "signed out".
    throw new ApiError(401, 'Your session has expired. Please sign in again.');
  }
  if (res.status === 404) {
    // Tenant isolation returns 404 (not 403) for cross-tenant access.
    throw new ApiError(404, 'Not found.');
  }
  if (res.status === 501) {
    // Endpoint reserved but not yet implemented on the backend.
    throw new ApiError(501, 'This feature is not available yet.');
  }

  // Parse the body (may be empty on 204).
  let payload = null;
  const text = await res.text();
  if (text) {
    try { payload = JSON.parse(text); } catch { payload = text; }
  }

  if (res.status === 422) {
    // FastAPI validation error: { detail: [{ loc, msg, type }] }
    throw new ApiError(422, 'Validation failed.', payload?.detail ?? []);
  }
  if (!res.ok) {
    const msg = payload?.detail || payload?.message || `Request failed (${res.status}).`;
    throw new ApiError(res.status, typeof msg === 'string' ? msg : `Request failed (${res.status}).`);
  }

  return payload;
}

// List endpoints return { data: [...], pagination: { limit, offset, total } }.
// This unwraps to a predictable shape so callers always read `.data`/`.pagination`.
async function getList(path, params) {
  const payload = await request(path, { method: 'GET', params });
  return {
    data: payload?.data ?? [],
    pagination: payload?.pagination ?? { limit: 0, offset: 0, total: 0 },
  };
}

export const api = {
  get: (path, params) => request(path, { method: 'GET', params }),
  post: (path, body) => request(path, { method: 'POST', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  del: (path) => request(path, { method: 'DELETE' }),
  getList,
};

// Resolve the caller's identity, role and tenant. Shape (per OpenAPI MeResponse):
// { id, email, name, role, status, tenant: { id, name } }
export function getMe() {
  return api.get('/me');
}
