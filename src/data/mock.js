// ─────────────────────────────────────────────────────────────────────────
// FlowDesk — in-memory mock data layer
//
// No backend, no API calls. Everything the prototype renders is hardcoded
// here and exposed through small selector helpers. Models the 6-table
// FlowDesk data model (UUID-style string ids), internally consistent:
// every assignedTo / createdBy / userId references a real user, and each
// incident's workflowTransitions match its current status.
// ─────────────────────────────────────────────────────────────────────────

// Reference "now" for the prototype so screenshots are deterministic.
const NOW = new Date('2026-06-29T10:30:00');

const iso = (d) => d.toISOString();
const addDays = (dateStr, days) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return iso(d);
};

// ── Table 1: tenants ──────────────────────────────────────────────────────
export const tenants = [
  {
    id: 't-001',
    name: 'Demo Organisation',
    plan: 'Pro',
    createdAt: '2025-11-03T08:00:00.000Z',
  },
  // A couple of extra tenants so the System Admin "Tenants" view isn't empty.
  {
    id: 't-002',
    name: 'Riverside Logistics',
    plan: 'Basic',
    createdAt: '2026-01-19T08:00:00.000Z',
  },
  {
    id: 't-003',
    name: 'Coastal Retail Group',
    plan: 'Pro',
    createdAt: '2026-03-27T08:00:00.000Z',
  },
];

export const PRIMARY_TENANT_ID = 't-001';

// ── Table 2: users ────────────────────────────────────────────────────────
// roles: "System Admin" | "Tenant Admin" | "Staff" | "Reviewer"
// status: "Active" | "Deactivated"
export const users = [
  { id: 'u-101', tenantId: 't-001', name: 'Marcus Webb',        email: 'marcus.webb@flowdesk.io',          role: 'System Admin', status: 'Active' },
  { id: 'u-102', tenantId: 't-001', name: 'Priya Nair',         email: 'priya.nair@demoorg.example',  role: 'Tenant Admin', status: 'Active' },
  { id: 'u-103', tenantId: 't-001', name: "Liam O'Connor",      email: 'liam.oconnor@demoorg.example',role: 'Staff',        status: 'Active' },
  { id: 'u-104', tenantId: 't-001', name: 'Sophie Nguyen',      email: 'sophie.nguyen@demoorg.example', role: 'Staff',      status: 'Active' },
  { id: 'u-105', tenantId: 't-001', name: 'James Patel',        email: 'james.patel@demoorg.example', role: 'Staff',        status: 'Active' },
  { id: 'u-106', tenantId: 't-001', name: 'Hannah Fitzgerald',  email: 'hannah.fitzgerald@demoorg.example', role: 'Reviewer', status: 'Active' },
  { id: 'u-107', tenantId: 't-001', name: 'Daniel Kovač',       email: 'daniel.kovac@demoorg.example',role: 'Reviewer',     status: 'Active' },
  { id: 'u-108', tenantId: 't-001', name: 'Olivia Brooks',      email: 'olivia.brooks@demoorg.example', role: 'Staff',      status: 'Deactivated' },
];

// ── Table 3: categories ───────────────────────────────────────────────────
export const categories = [
  { id: 'c-1', tenantId: 't-001', name: 'IT / Systems',       description: 'Hardware, software, network and access-related incidents.' },
  { id: 'c-2', tenantId: 't-001', name: 'Facilities',         description: 'Building, equipment, maintenance and physical environment.' },
  { id: 'c-3', tenantId: 't-001', name: 'Workplace Safety',   description: 'Injury, hazard and workplace risk events.' },
  { id: 'c-4', tenantId: 't-001', name: 'HR',                 description: 'People, onboarding, conduct and workplace matters.' },
  { id: 'c-5', tenantId: 't-001', name: 'Security & Privacy', description: 'Cyber security, data privacy and access breaches.' },
];

// ── Table 4: incidents ────────────────────────────────────────────────────
// severity: "Low" | "Medium" | "High" | "Critical"
// status:   "Open" | "In Review" | "Closed"
// 16 incidents across the last 8 weeks (to 2026-06-29), with natural weekly
// variation. Older incidents are Closed, recent ones Open — so the audit
// trail, status mix and time-series charts all tell a consistent story.
export const incidents = [
  // Week of May 4 (1)
  { reference: 'INC-1031', title: 'VPN outage affecting remote workers',             category: 'IT / Systems',       severity: 'High',     status: 'Closed',    createdBy: 'u-103', assignedTo: 'u-106', createdAt: '2026-05-05T09:14:00', closeAfter: 4 },
  // Week of May 11 (3)
  { reference: 'INC-1032', title: 'Unlabelled chemical containers in cleaning store', category: 'Workplace Safety',  severity: 'Medium',   status: 'Closed',    createdBy: 'u-104', assignedTo: 'u-107', createdAt: '2026-05-12T14:02:00', closeAfter: 3 },
  { reference: 'INC-1033', title: 'Air-conditioning failure in primary server room', category: 'Facilities',         severity: 'High',     status: 'Closed',    createdBy: 'u-105', assignedTo: 'u-106', createdAt: '2026-05-13T07:48:00', closeAfter: 2 },
  { reference: 'INC-1034', title: 'Forklift near-miss in loading bay',               category: 'Workplace Safety',   severity: 'Critical', status: 'Closed',    createdBy: 'u-104', assignedTo: 'u-107', createdAt: '2026-05-15T11:25:00', closeAfter: 6 },
  // Week of May 18 (2)
  { reference: 'INC-1035', title: 'Phishing email reported by reception',            category: 'Security & Privacy', severity: 'Medium',   status: 'Closed',    createdBy: 'u-103', assignedTo: 'u-106', createdAt: '2026-05-19T08:36:00', closeAfter: 2 },
  { reference: 'INC-1036', title: 'Broken handrail near east stairwell',             category: 'Facilities',         severity: 'Low',      status: 'Closed',    createdBy: 'u-105', assignedTo: 'u-107', createdAt: '2026-05-22T16:10:00', closeAfter: 5 },
  // Week of May 25 (2)
  { reference: 'INC-1037', title: 'Staff roster app login failures',                 category: 'IT / Systems',       severity: 'Low',      status: 'Closed',    createdBy: 'u-104', assignedTo: 'u-107', createdAt: '2026-05-27T10:20:00', closeAfter: 3 },
  { reference: 'INC-1038', title: 'Unauthorised access attempt on admin portal',     category: 'Security & Privacy', severity: 'High',     status: 'In Review', createdBy: 'u-104', assignedTo: 'u-107', createdAt: '2026-05-29T22:08:00' },
  // Week of Jun 1 (2)
  { reference: 'INC-1039', title: 'Fire door not closing automatically',             category: 'Facilities',         severity: 'Medium',   status: 'In Review', createdBy: 'u-105', assignedTo: 'u-106', createdAt: '2026-06-02T09:55:00' },
  { reference: 'INC-1040', title: 'CRM system slow at peak hours',                   category: 'IT / Systems',       severity: 'Medium',   status: 'In Review', createdBy: 'u-103', assignedTo: 'u-107', createdAt: '2026-06-04T13:41:00' },
  // Week of Jun 8 (1)
  { reference: 'INC-1041', title: 'Chemical splash in maintenance workshop',         category: 'Workplace Safety',   severity: 'Critical', status: 'In Review', createdBy: 'u-103', assignedTo: 'u-107', createdAt: '2026-06-10T18:30:00' },
  // Week of Jun 15 (2)
  { reference: 'INC-1042', title: 'Wi-Fi dropouts in west wing office',              category: 'IT / Systems',       severity: 'Medium',   status: 'In Review', createdBy: 'u-105', assignedTo: 'u-106', createdAt: '2026-06-16T11:05:00' },
  { reference: 'INC-1043', title: 'Onboarding paperwork missing for new hire',       category: 'HR',                 severity: 'Low',      status: 'Open',      createdBy: 'u-104', assignedTo: null,    createdAt: '2026-06-18T08:50:00' },
  // Week of Jun 22 (3)
  { reference: 'INC-1044', title: 'Spill in main corridor — slip hazard',            category: 'Facilities',         severity: 'Medium',   status: 'Open',      createdBy: 'u-103', assignedTo: null,    createdAt: '2026-06-23T15:33:00' },
  { reference: 'INC-1045', title: 'Emergency exit blocked by stored pallets',        category: 'Workplace Safety',   severity: 'High',     status: 'Open',      createdBy: 'u-105', assignedTo: 'u-106', createdAt: '2026-06-24T12:12:00' },
  { reference: 'INC-1046', title: 'Email server intermittent delays',                category: 'IT / Systems',       severity: 'Medium',   status: 'Open',      createdBy: 'u-104', assignedTo: 'u-106', createdAt: '2026-06-26T09:02:00' },
].map((inc, i) => {
  const updatedAt =
    inc.status === 'Closed'
      ? addDays(inc.createdAt, inc.closeAfter ?? 3)
      : inc.status === 'In Review'
      ? addDays(inc.createdAt, 1)
      : inc.createdAt;
  return {
    id: `i-${1031 + i}`,
    tenantId: 't-001',
    reference: inc.reference,
    title: inc.title,
    description: descriptionFor(inc.reference),
    category: inc.category,
    severity: inc.severity,
    status: inc.status,
    createdBy: inc.createdBy,
    assignedTo: inc.assignedTo,
    createdAt: inc.createdAt,
    updatedAt,
  };
});

function descriptionFor(ref) {
  const map = {
    'INC-1031': 'Remote workers reported being unable to establish a VPN connection from 08:40. Sessions dropped intermittently, blocking access to internal systems. Network team engaged; suspected certificate expiry on the gateway appliance.',
    'INC-1032': 'Several chemical containers in the cleaning store were found without hazard labels and stored beside general supplies. Reported by a staff member as a handling and exposure risk requiring review.',
    'INC-1033': 'Temperature alarm triggered in the primary server room after the CRAC unit failed overnight. Ambient temperature reached 31°C. Facilities and IT coordinated an emergency portable cooling unit.',
    'INC-1034': 'A forklift reversing in the loading bay came close to striking a pedestrian who stepped out from behind a stack of pallets. No contact was made; flagged as a near-miss requiring a review of pedestrian walkways.',
    'INC-1035': 'Reception staff received and reported a suspicious email impersonating the IT helpdesk requesting password confirmation. No credentials were entered. Forwarded to Security for analysis and tenant-wide warning.',
    'INC-1036': 'The handrail on the east stairwell between levels 1 and 2 is loose and pulls away from the wall under load. Tagged out of use pending repair to prevent a fall.',
    'INC-1037': 'Staff intermittently cannot log in to the rostering app — authentication returns a 500 error roughly one attempt in four. Vendor ticket raised; appears related to a recent SSO change.',
    'INC-1038': 'Multiple failed login attempts against the admin portal were detected from an unrecognised IP range over a 20-minute period. Account lockout triggered. Under investigation by Security & Privacy.',
    'INC-1039': 'The fire door on level 2 (north wing) no longer closes and latches automatically; the closer arm appears damaged. Currently held by a wedge, which is a fire-compliance breach.',
    'INC-1040': 'Staff report the CRM system becomes unresponsive (10–20s page loads) between 08:00–09:30 and again at 16:00. Database query latency suspected during peak login windows.',
    'INC-1041': 'A maintenance technician was splashed with cleaning chemical while decanting from a drum in the workshop. First aid administered and the exposure protocol initiated. Requires safety review and follow-up.',
    'INC-1042': 'West wing office staff report Wi-Fi dropping every few minutes on mobile devices, interrupting their work. Signal strength appears adequate; suspected access-point roaming issue.',
    'INC-1043': 'Onboarding compliance paperwork (police check and reference checks) is missing for a new hire starting Monday. HR cannot confirm clearance for them to commence.',
    'INC-1044': 'A liquid spill in the main ground-floor corridor near the cafeteria was reported as a slip hazard. Wet-floor signage placed; cleaning requested. High foot-traffic area.',
    'INC-1045': 'Pallets from a delivery were left stacked in front of a marked emergency exit on the ground floor, obstructing egress. Fire-compliance breach. Requires urgent removal and a reminder to the receiving team.',
    'INC-1046': 'Outbound and internal email is being delivered with delays of 15–40 minutes intermittently since this morning. Mail queue backing up on the relay; investigating.',
  };
  return map[ref] ?? 'Incident reported via the FlowDesk submission form.';
}

// ── Table 5: notifications ────────────────────────────────────────────────
export const notifications = [
  { id: 'n-1', userId: 'u-102', incidentRef: 'INC-1045', message: 'New High-severity incident reported: Emergency exit blocked by stored pallets.', read: false, createdAt: '2026-06-29T08:05:00' },
  { id: 'n-2', userId: 'u-102', incidentRef: 'INC-1044', message: 'Incident "Spill in main corridor" is awaiting triage.', read: false, createdAt: '2026-06-26T16:42:00' },
  { id: 'n-3', userId: 'u-106', incidentRef: 'INC-1042', message: 'You were assigned to review INC-1042 — Wi-Fi dropouts in west wing office.', read: false, createdAt: '2026-06-16T11:20:00' },
  { id: 'n-4', userId: 'u-107', incidentRef: 'INC-1041', message: 'INC-1041 moved to In Review and assigned to you.', read: true, createdAt: '2026-06-11T07:30:00' },
  { id: 'n-5', userId: 'u-102', incidentRef: 'INC-1037', message: 'INC-1037 was closed by Daniel Kovač.', read: true, createdAt: '2026-05-30T13:15:00' },
  { id: 'n-6', userId: 'u-106', incidentRef: 'INC-1038', message: 'Reminder: INC-1038 has been In Review for 3 days.', read: false, createdAt: '2026-06-01T10:00:00' },
];

// ── Table 6: workflowTransitions ──────────────────────────────────────────
// Built from incidents so the audit trail always matches current status.
const CLOSE_NOTES = {
  'INC-1031': 'Gateway certificate renewed and VPN service restored. Confirmed with remote users.',
  'INC-1032': 'Containers correctly labelled and moved to the chemical store; handling guidance reissued to staff.',
  'INC-1033': 'CRAC unit repaired; temperatures stable. Portable units removed.',
  'INC-1034': 'Pedestrian walkway re-marked and segregated from the forklift route; near-miss shared at the safety toolbox talk.',
  'INC-1035': 'No credentials compromised. Tenant-wide phishing advisory issued.',
  'INC-1036': 'Handrail re-secured and load-tested by maintenance.',
  'INC-1037': 'Vendor applied SSO fix; roster login success confirmed across devices.',
};

export const workflowTransitions = [];
incidents.forEach((inc) => {
  const base = inc.id;
  // 1) Creation
  workflowTransitions.push({
    id: `${base}-t1`,
    incidentId: inc.id,
    fromState: null,
    toState: 'Open',
    byUser: inc.createdBy,
    note: 'Incident reported and logged.',
    at: inc.createdAt,
  });
  // 2) Triage → In Review (for In Review and Closed)
  if (inc.status === 'In Review' || inc.status === 'Closed') {
    workflowTransitions.push({
      id: `${base}-t2`,
      incidentId: inc.id,
      fromState: 'Open',
      toState: 'In Review',
      byUser: 'u-102', // Tenant Admin triages & assigns
      note: `Triaged and assigned to ${nameFor(inc.assignedTo)} for review.`,
      at: addDays(inc.createdAt, 1),
    });
  }
  // 3) Close (for Closed only)
  if (inc.status === 'Closed') {
    workflowTransitions.push({
      id: `${base}-t3`,
      incidentId: inc.id,
      fromState: 'In Review',
      toState: 'Closed',
      byUser: inc.assignedTo,
      note: CLOSE_NOTES[inc.reference] ?? 'Resolved and verified. Incident closed.',
      at: inc.updatedAt,
    });
  }
});

function nameFor(userId) {
  const u = users.find((x) => x.id === userId);
  return u ? u.name : 'Unassigned';
}

// ─────────────────────────────────────────────────────────────────────────
// Selectors
// ─────────────────────────────────────────────────────────────────────────

export const getTenants = () => tenants;

export const getIncidents = () => incidents;

export const getIncidentByRef = (ref) =>
  incidents.find((i) => i.reference === ref) || null;

export const getUsers = () => users;

export const getUserById = (id) => users.find((u) => u.id === id) || null;

export const getCategories = () =>
  categories.map((c) => ({
    ...c,
    incidentCount: incidents.filter((i) => i.category === c.name).length,
  }));

export const getNotifications = () =>
  [...notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

export const getUnreadCount = () =>
  notifications.filter((n) => !n.read).length;

export const getTransitionsForIncident = (incidentId) =>
  workflowTransitions
    .filter((t) => t.incidentId === incidentId)
    .sort((a, b) => new Date(a.at) - new Date(b.at));

// Counts, series and headline figures for the dashboards / charts.
export const getDashboardStats = () => {
  const total = incidents.length;
  const byStatus = {
    open: incidents.filter((i) => i.status === 'Open').length,
    inReview: incidents.filter((i) => i.status === 'In Review').length,
    closed: incidents.filter((i) => i.status === 'Closed').length,
  };

  const statusSeries = [
    { name: 'Open', value: byStatus.open, color: '#2563EB' },
    { name: 'In Review', value: byStatus.inReview, color: '#D97706' },
    { name: 'Closed', value: byStatus.closed, color: '#16A34A' },
  ];

  // 8 weekly buckets, stacked by status, from May 4 → Jun 22.
  const weekStarts = [
    '2026-05-04', '2026-05-11', '2026-05-18', '2026-05-25',
    '2026-06-01', '2026-06-08', '2026-06-15', '2026-06-22',
  ];
  const weekLabels = ['May 4', 'May 11', 'May 18', 'May 25', 'Jun 1', 'Jun 8', 'Jun 15', 'Jun 22'];
  const base = new Date('2026-05-04T00:00:00');
  const weekly = weekStarts.map((_, idx) => ({
    week: weekLabels[idx],
    incidents: 0,
    Open: 0,
    'In Review': 0,
    Closed: 0,
  }));
  incidents.forEach((i) => {
    const days = Math.floor((new Date(i.createdAt) - base) / (1000 * 60 * 60 * 24));
    const idx = Math.max(0, Math.min(7, Math.floor(days / 7)));
    weekly[idx].incidents += 1;
    weekly[idx][i.status] += 1;
  });

  const sevOrder = ['Low', 'Medium', 'High', 'Critical'];
  const bySeverity = sevOrder.map((name) => ({
    name,
    value: incidents.filter((i) => i.severity === name).length,
  }));

  const byCategory = categories.map((c) => ({
    name: c.name,
    value: incidents.filter((i) => i.category === c.name).length,
  }));

  // Avg resolution time (days) across closed incidents.
  const closed = incidents.filter((i) => i.status === 'Closed');
  const avgResolutionDays =
    closed.length === 0
      ? 0
      : closed.reduce(
          (sum, i) =>
            sum + (new Date(i.updatedAt) - new Date(i.createdAt)) / (1000 * 60 * 60 * 24),
          0,
        ) / closed.length;

  const totalThisMonth = incidents.filter((i) => {
    const d = new Date(i.createdAt);
    return d.getFullYear() === 2026 && d.getMonth() === 5; // June
  }).length;

  const openCritical = incidents.filter(
    (i) => i.severity === 'Critical' && i.status !== 'Closed',
  ).length;

  return {
    total,
    byStatus,
    statusSeries,
    weekly,
    bySeverity,
    byCategory,
    avgResolutionDays: Math.round(avgResolutionDays * 10) / 10,
    totalThisMonth,
    openCritical,
  };
};

// Convenience for the prototype's "current tenant".
export const getPrimaryTenant = () =>
  tenants.find((t) => t.id === PRIMARY_TENANT_ID);
