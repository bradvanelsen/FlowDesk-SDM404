// Workspace settings service (contract v2.2 §4.10) — the settings of ONE
// organisation, edited by its own tenant_admin. system_admin is EXCLUDED
// (D-6): every other role gets 403 insufficient_role. These are not UC-01's
// platform settings — that remains unbuilt (D-19 scope note).
import { api } from './api';

// 200 → { id, name, timezone, created_at, updated_at }
export function getSettings() {
  return api.get('/settings');
}

// PATCH takes name, timezone, or both; omitted/null fields are left alone
// (both columns are NOT NULL — there is no "clear"). The response is the
// saved record — render THAT, not what was typed (the D-18 distinction).
// timezone is LOAD-BEARING: analytics weeks bucket by it per organisation.
export function updateSettings(body) {
  return api.patch('/settings', body);
}
