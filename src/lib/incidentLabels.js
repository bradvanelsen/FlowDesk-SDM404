// Single source of truth for mapping incident enums between the API's
// lowercase values (contract §3.3) and the display labels the UI shows.
// Mirrors lib/roles.js — do not scatter these literals around.

// incident_status: open | in_review | closed
export const INCIDENT_STATUS_LABELS = {
  open: 'Open',
  in_review: 'In Review',
  closed: 'Closed',
};

// severity: low | medium | high | critical (order is also the API sort order)
export const SEVERITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

const API_STATUS = Object.fromEntries(
  Object.entries(INCIDENT_STATUS_LABELS).map(([k, v]) => [v, k]),
);
const API_SEVERITY = Object.fromEntries(
  Object.entries(SEVERITY_LABELS).map(([k, v]) => [v, k]),
);

export const incidentStatusLabel = (api) => INCIDENT_STATUS_LABELS[api] ?? api;
export const severityLabel = (api) => SEVERITY_LABELS[api] ?? api;
export const toApiIncidentStatus = (label) => API_STATUS[label] ?? label;
export const toApiSeverity = (label) => API_SEVERITY[label] ?? label;
