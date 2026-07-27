// Single source of truth for mapping between the backend's API values
// (snake_case per the OpenAPI contract) and the friendly labels the UI shows.
// Keep this mapping here — do not scatter role/status string literals around.

// Role: system_admin | tenant_admin | staff | reviewer
export const ROLE_LABELS = {
  system_admin: 'System Admin',
  tenant_admin: 'Tenant Admin',
  staff: 'Staff',
  reviewer: 'Reviewer',
};

// UserStatus: active | inactive  (the UI historically labels inactive "Deactivated")
export const STATUS_LABELS = {
  active: 'Active',
  inactive: 'Deactivated',
};

// Reverse maps (label -> API value) for when the UI sends a value back.
const API_ROLE = Object.fromEntries(Object.entries(ROLE_LABELS).map(([k, v]) => [v, k]));
const API_STATUS = Object.fromEntries(Object.entries(STATUS_LABELS).map(([k, v]) => [v, k]));

export const roleLabel = (apiRole) => ROLE_LABELS[apiRole] ?? apiRole;
export const statusLabel = (apiStatus) => STATUS_LABELS[apiStatus] ?? apiStatus;
export const toApiRole = (label) => API_ROLE[label] ?? label;
export const toApiStatus = (label) => API_STATUS[label] ?? label;
