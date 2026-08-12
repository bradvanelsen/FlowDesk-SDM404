// Live dashboard aggregates (D-24). Mirrors the shape of the old mock
// getDashboardStats() selector so Dashboard.jsx swaps its source without a
// rewrite. All figures derive from the caller's OWN server-scoped visibility:
// staff see their submissions, reviewers their queue, admins the tenant —
// so the totals always reconcile with what GET /incidents reports for the
// same login.
import { api } from './api';
import { listIncidents } from './incidents';
import { getVolume } from './analytics';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const weekLabel = (d) => `${d.getDate()} ${MONTHS[d.getMonth()]}`;

// `pagination.total` is the pre-limit count, so limit=1 gives a cheap count
// query (the API's minimum limit is 1 — there is no count-only mode).
async function statusTotal(status) {
  const { pagination } = await api.getList('/incidents', { status, limit: 1 });
  return pagination.total;
}

// Fallback weekly buckets for roles the analytics endpoint 403s
// (staff/reviewer): bucket the caller's own visible incidents client-side,
// Monday-start weeks in the browser's timezone. The admin path uses the
// server-computed Melbourne buckets instead (contract §4.9) — this fallback
// only ever charts the caller's personal scope, so the two are never shown
// side-by-side.
function bucketWeekly(incidents, weeks = 8) {
  const MS_WK = 7 * 24 * 3600 * 1000;
  const monday = new Date();
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const start = monday.getTime() - (weeks - 1) * MS_WK;
  const buckets = Array.from({ length: weeks }, (_, i) => ({
    week: weekLabel(new Date(start + i * MS_WK)),
    incidents: 0,
  }));
  for (const inc of incidents) {
    const idx = Math.floor((new Date(inc.createdAt).getTime() - start) / MS_WK);
    if (idx >= 0 && idx < weeks) buckets[idx].incidents += 1;
  }
  return buckets;
}

export async function getDashboardStats() {
  const [open, inReview, closed] = await Promise.all([
    statusTotal('open'),
    statusTotal('in_review'),
    statusTotal('closed'),
  ]);
  const byStatus = { open, inReview, closed };
  const total = open + inReview + closed;

  let weekly;
  try {
    const { buckets } = await getVolume();
    weekly = buckets.map((b) => {
      const [, m, d] = b.weekStart.split('-').map(Number);
      return { week: `${d} ${MONTHS[m - 1]}`, incidents: b.count };
    });
  } catch (err) {
    if (err?.status !== 403) throw err;
    const { incidents } = await listIncidents({ limit: 100, sort: 'created_at', order: 'desc' });
    weekly = bucketWeekly(incidents);
  }

  const statusSeries = [
    { name: 'Open', value: open },
    { name: 'In Review', value: inReview },
    { name: 'Closed', value: closed },
  ];

  return { total, byStatus, statusSeries, weekly };
}
