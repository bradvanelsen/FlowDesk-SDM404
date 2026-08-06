import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, PlusCircle, Filter, Loader2 } from 'lucide-react';
import {
  PageHeader, Card, Button, Badge, Avatar, Select,
  Table, THead, TH, TBody, TR, TD,
} from '../components/ui';
import { useApp } from '../context/AppContext';
import { listIncidents } from '../services/incidents';
import { toApiIncidentStatus, toApiSeverity } from '../lib/incidentLabels';
import { formatDate } from '../lib/utils';

export default function IncidentList() {
  const navigate = useNavigate();
  const { role } = useApp();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const [severity, setSeverity] = useState('All');
  const [incidents, setIncidents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Status/severity are server-side query params (contract §4.5). Free-text
  // search stays client-side — the API has no search parameter. Visibility
  // scoping (staff = own, reviewer = assigned + unassigned, admin = tenant)
  // is enforced server-side; never re-filter by role here.
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    const params = { limit: 100, sort: 'created_at', order: 'desc' };
    if (status !== 'All') params.status = toApiIncidentStatus(status);
    if (severity !== 'All') params.severity = toApiSeverity(severity);
    listIncidents(params)
      .then(({ incidents: rows, pagination }) => {
        if (!active) return;
        setIncidents(rows);
        setTotal(pagination.total);
      })
      .catch((err) => {
        if (active) setError(err?.message || 'Could not load incidents.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [status, severity]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q === '') return incidents;
    return incidents.filter(
      (i) => i.title.toLowerCase().includes(q) || i.category.toLowerCase().includes(q),
    );
  }, [incidents, query]);

  return (
    <>
      <PageHeader
        title="Incidents"
        subtitle="All reported incidents you can see in your organisation"
        actions={
          role === 'Staff' && (
            <Button icon={PlusCircle} onClick={() => navigate('/incidents/new')}>
              New incident
            </Button>
          )
        }
      />

      <Card className="mb-5 p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title or category…"
              className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:border-teal-brand focus:ring-2 focus:ring-teal-brand/25"
            />
          </div>
          <div className="flex items-center gap-3">
            <Filter size={16} className="hidden text-slate-400 sm:block" />
            <div className="w-40">
              <Select size="sm" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status filter">
                <option value="All">All statuses</option>
                <option>Open</option>
                <option>In Review</option>
                <option>Closed</option>
              </Select>
            </div>
            <div className="w-40">
              <Select size="sm" value={severity} onChange={(e) => setSeverity(e.target.value)} aria-label="Severity filter">
                <option value="All">All severities</option>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {loading ? (
        <Card className="flex items-center justify-center gap-2 py-14 text-sm text-slate-400">
          <Loader2 size={16} className="animate-spin" /> Loading incidents…
        </Card>
      ) : error ? (
        <Card className="py-14 text-center text-sm text-red-600">{error}</Card>
      ) : (
        <Card padded={false}>
          <Table className="rounded-none border-0 shadow-none">
            <THead>
              <TR>
                <TH>Title</TH>
                <TH>Category</TH>
                <TH>Severity</TH>
                <TH>Status</TH>
                <TH>Reported by</TH>
                <TH>Assigned to</TH>
                <TH>Created</TH>
              </TR>
            </THead>
            <TBody>
              {filtered.map((inc) => (
                <TR key={inc.id} onClick={() => navigate(`/incidents/${inc.id}`)}>
                  <TD className="max-w-[24rem] truncate font-medium text-slate-800">{inc.title}</TD>
                  <TD className="text-slate-500 whitespace-nowrap">{inc.category}</TD>
                  <TD><Badge severity={inc.severity} dot /></TD>
                  <TD><Badge status={inc.status} /></TD>
                  <TD className="text-slate-500 whitespace-nowrap">{inc.submittedBy?.name ?? '—'}</TD>
                  <TD>
                    {inc.assignedTo ? (
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <Avatar name={inc.assignedTo.name} size="xs" />
                        <span className="text-slate-600">{inc.assignedTo.name}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Unassigned</span>
                    )}
                  </TD>
                  <TD className="text-slate-500 whitespace-nowrap">{formatDate(inc.createdAt)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
          {filtered.length === 0 && (
            <div className="py-14 text-center text-sm text-slate-400">
              {incidents.length === 0
                ? 'No incidents yet.'
                : 'No incidents match your filters.'}
            </div>
          )}
        </Card>
      )}

      {!loading && !error && (
        <p className="mt-3 text-xs text-slate-400">
          Showing {filtered.length} of {total} incident{total === 1 ? '' : 's'}
        </p>
      )}
    </>
  );
}
