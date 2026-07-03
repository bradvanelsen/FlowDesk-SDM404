import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, PlusCircle, Filter } from 'lucide-react';
import {
  PageHeader, Card, Button, Badge, Avatar, Input, Select,
  Table, THead, TH, TBody, TR, TD,
} from '../components/ui';
import { getIncidents, getUserById } from '../data/mock';
import { formatDate } from '../lib/utils';

export default function IncidentList() {
  const navigate = useNavigate();
  const all = getIncidents();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const [severity, setSeverity] = useState('All');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all
      .filter((i) => (status === 'All' ? true : i.status === status))
      .filter((i) => (severity === 'All' ? true : i.severity === severity))
      .filter((i) =>
        q === ''
          ? true
          : i.title.toLowerCase().includes(q) ||
            i.reference.toLowerCase().includes(q) ||
            i.category.toLowerCase().includes(q),
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [all, query, status, severity]);

  return (
    <>
      <PageHeader
        title="Incidents"
        subtitle="All reported incidents across the organisation"
        actions={
          <Button icon={PlusCircle} onClick={() => navigate('/incidents/new')}>
            New incident
          </Button>
        }
      />

      <Card className="mb-5 p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by reference, title or category…"
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

      <Card padded={false}>
        <Table className="rounded-none border-0 shadow-none">
          <THead>
            <TR>
              <TH>Reference</TH>
              <TH>Title</TH>
              <TH>Category</TH>
              <TH>Severity</TH>
              <TH>Status</TH>
              <TH>Assigned to</TH>
              <TH>Created</TH>
            </TR>
          </THead>
          <TBody>
            {filtered.map((inc) => {
              const assignee = getUserById(inc.assignedTo);
              return (
                <TR key={inc.id} onClick={() => navigate(`/incidents/${inc.reference}`)}>
                  <TD className="font-medium text-teal-brand whitespace-nowrap">{inc.reference}</TD>
                  <TD className="max-w-[22rem] truncate font-medium text-slate-800">{inc.title}</TD>
                  <TD className="text-slate-500 whitespace-nowrap">{inc.category}</TD>
                  <TD><Badge severity={inc.severity} dot /></TD>
                  <TD><Badge status={inc.status} /></TD>
                  <TD>
                    {assignee ? (
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <Avatar name={assignee.name} size="xs" />
                        <span className="text-slate-600">{assignee.name}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Unassigned</span>
                    )}
                  </TD>
                  <TD className="text-slate-500 whitespace-nowrap">{formatDate(inc.createdAt)}</TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
        {filtered.length === 0 && (
          <div className="py-14 text-center text-sm text-slate-400">
            No incidents match your filters.
          </div>
        )}
      </Card>

      <p className="mt-3 text-xs text-slate-400">
        Showing {filtered.length} of {all.length} incidents
      </p>
    </>
  );
}
