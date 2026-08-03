// API client — the ONLY place the app calls `fetch` (SRS Appendix B.2).
//
// Talks to the FastAPI backend. Attaches the Supabase JWT on every request and
// normalises every failure into a single ApiError. Error handling is typed from
// the contract's §3.1 envelope — NOT from /openapi.json, whose 422 schema is
// wrong (docs/api-contract.md §1.2).
import { getAccessToken } from './auth';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

// One error type the whole app can switch on.
//   status  — HTTP status (0 = network/config failure)
//   code    — envelope error.code ('unauthorized', 'conflict', …)
//   reason  — envelope error.details.reason ('token_expired', …) or null.
//             401 handlers MUST branch on this, never on the status alone
//             (§3.1.3) — and GET /me can 401 with NO reason at all (D-12).
//   details — the full error.details object (framework 422s carry
//             details.errors; business-rule 422s carry details.reason)
export class ApiError extends Error {
  constructor(status, message, { code = null, reason = null, details = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.reason = reason;
    this.details = details;
  }
}

// Build an ApiError from a non-2xx response. Contract §3.1.4: 5xx and CORS
// rejections are PLAIN TEXT, not the envelope — never assume the body is JSON.
async function errorFrom(res) {
  const text = await res.text().catch(() => '');

  if (res.status >= 500) {
    return new ApiError(res.status, 'Server error. Please try again.', {
      code: 'internal_error',
    });
  }

  try {
    const envelope = JSON.parse(text)?.error;
    if (envelope) {
      const details = envelope.details ?? null;
      return new ApiError(res.status, envelope.message || `Request failed (${res.status}).`, {
        code: envelope.code ?? null,
        reason: details && typeof details === 'object' ? (details.reason ?? null) : null,
        details,
      });
    }
  } catch {
    // Non-JSON body — fall through to the generic error below.
  }
  return new ApiError(res.status, text || `Request failed (${res.status}).`, { code: 'unknown' });
}

async function request(path, { method = 'GET', body, params } = {}) {
  if (!BASE_URL) {
    throw new ApiError(0, 'API base URL is not configured (VITE_API_BASE_URL).');
  }

  // Paths are joined with no trailing slash — the 307 redirect a trailing
  // slash triggers downgrades to http:// and the browser blocks it (D-15).
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
        // Mandatory whenever a body is present: omitting it on the public
        // POST /organizations produces a plain-text 500 that surfaces in the
        // browser as an opaque CORS failure (D-13).
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        // The backend verifies this JWT via Supabase JWKS and enforces RBAC.
        // No session → no header, which is exactly what public endpoints need.
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Network error — could not reach the server.');
  }

  if (!res.ok) throw await errorFrom(res);

  // Parse the success body (may be empty on 204).
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// Map a framework 422 to { formField: message } for inline display.
// §3.1.5: `loc` is NOT always ["body", "<field>"] — loc[1] can be an integer
// (malformed-JSON character offset) or absent (body missing entirely), so
// anything that isn't a plain field name lands on '_form' as a form-level
// message instead of rendering "14" as a field name.
export function fieldErrorsFrom(err, fieldMap = {}) {
  const out = {};
  const errors = err?.details?.errors;
  if (!Array.isArray(errors)) return out;
  for (const e of errors) {
    const loc = Array.isArray(e.loc) ? e.loc : [];
    const apiField = typeof loc[1] === 'string' ? loc[1] : '_form';
    const field = fieldMap[apiField] ?? apiField;
    if (!out[field]) out[field] = e.msg || 'Invalid value.';
  }
  return out;
}

// List endpoints return { data: [...], pagination: { limit, offset, total } }.
// This unwraps to a predictable shape so callers always read `.data`.
// (GET /analytics/volume deliberately does not use this envelope — call
// api.get for it and read its own window metadata.)
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

// Resolve the caller's identity, role and tenant (contract §4.1):
// { id, email, name, role, status, tenant: { id, name } }
export function getMe() {
  return api.get('/me');
}

// Self-service sign-up (contract §4.2). Public — with no session there is no
// auth header, which is what this endpoint expects. 201 → { tenant, admin_user }.
// No password or token comes back: Supabase emails the admin a set-password
// link (§2.6). Note admin_user.email is normalised server-side and can differ
// from what was submitted — display the response value, not the input.
export function registerOrganization({ organizationName, adminName, adminEmail }) {
  return api.post('/organizations', {
    organization_name: organizationName,
    admin_name: adminName,
    admin_email: adminEmail,
  });
}
