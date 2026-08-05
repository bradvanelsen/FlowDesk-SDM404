// Incident service (contract §4.5–4.6). All calls go through the shared api
// helper; rows are adapted to display shape at this boundary so components
// stay presentation-only.
import { api } from './api';
import { incidentStatusLabel, severityLabel } from '../lib/incidentLabels';

// IncidentOut → display shape. submitted_by / assigned_to are UserRef objects
// ({id, name, email}); category is a CategoryRef ({id, name}).
function adaptIncident(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description, // present on detail only
    category: row.category?.name ?? '',
    categoryId: row.category?.id ?? null,
    severity: severityLabel(row.severity),
    status: incidentStatusLabel(row.status),
    submittedBy: row.submitted_by ?? null,
    assignedTo: row.assigned_to ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function adaptTransition(t) {
  return {
    id: t.id,
    fromState: t.from_status ? incidentStatusLabel(t.from_status) : null,
    toState: incidentStatusLabel(t.to_status),
    byName: t.transitioned_by?.name ?? 'System',
    note: t.note,
    at: t.created_at,
  };
}

// IncidentDetail → display shape + timeline. A freshly submitted incident has
// transitions: [] BY DESIGN (contract §4.5) — the first timeline entry is
// synthesized client-side from created_at + submitted_by.
// allowed_transitions stays in RAW API values and is PER-CALLER — never cache
// it across users or roles.
function adaptDetail(row) {
  const base = adaptIncident(row);
  const timeline = [
    {
      id: `${row.id}-created`,
      fromState: null,
      toState: incidentStatusLabel('open'),
      byName: row.submitted_by?.name ?? 'Unknown',
      note: 'Incident reported and logged.',
      at: row.created_at,
      synthesized: true,
    },
    ...(row.transitions ?? []).map(adaptTransition),
  ];
  return { ...base, timeline, allowedTransitions: row.allowed_transitions ?? [] };
}

// List incidents. Params are API-shaped: { status, severity, sort, order,
// limit, offset } — there is NO server-side text search or category filter in
// the contract; free-text filtering stays client-side over the fetched page.
export async function listIncidents(params = {}) {
  const { data, pagination } = await api.getList('/incidents', params);
  return { incidents: data.map(adaptIncident), pagination };
}

export async function getIncident(id) {
  return adaptDetail(await api.get(`/incidents/${id}`));
}

// staff-only (the API 403s every other role — contract §4.5).
// body: { title, description, category_id, severity } — severity in API values.
export async function createIncident(body) {
  return adaptDetail(await api.post('/incidents', body));
}

// reviewer + tenant_admin. to_status in API values; note required in effect
// when closing. Returns the refreshed IncidentDetail (200, not 201).
export async function transitionIncident(id, { toStatus, note }) {
  return adaptDetail(
    await api.post(`/incidents/${id}/transitions`, { to_status: toStatus, note: note ?? null }),
  );
}

// tenant_admin ONLY (contract §4.6 — reviewer gets 403 here).
export async function assignIncident(id, assignedTo) {
  return adaptDetail(await api.post(`/incidents/${id}/assign`, { assigned_to: assignedTo }));
}
