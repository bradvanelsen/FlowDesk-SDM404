// Analytics service (contract §4.9). tenant_admin + system_admin only —
// staff/reviewer get 403.
//
// GET /analytics/volume is deliberately NOT the pagination envelope: it
// returns { data: [{week_start, count}], timezone, from, to, severity }.
// Weeks are Melbourne ISO weeks computed server-side — label the axis from
// the RESPONSE window, never generate Mondays client-side, and never treat
// zero-filled data as an error ("no data" is a 200 with zeros, not a 404).
import { api } from './api';

export async function getVolume(params = {}) {
  const res = await api.get('/analytics/volume', params);
  return {
    buckets: (res?.data ?? []).map((b) => ({ weekStart: b.week_start, count: b.count })),
    timezone: res?.timezone ?? '',
    from: res?.from ?? null,
    to: res?.to ?? null,
    severity: res?.severity ?? null,
  };
}
