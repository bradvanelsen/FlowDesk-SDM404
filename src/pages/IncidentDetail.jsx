import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, CheckCircle2, History, Loader2,
  Tag, User, UserCheck, CalendarPlus, CalendarClock,
} from 'lucide-react';
import {
  PageHeader, Card, CardHeader, Button, Badge, Avatar, Select, Textarea, STATUS_DOT,
} from '../components/ui';
import { useApp } from '../context/AppContext';
import { getIncident, transitionIncident, assignIncident } from '../services/incidents';
import { listUsers } from '../services/users';
import { formatDateTime, formatRelative } from '../lib/utils';
import { useNow } from '../lib/useNow';

function Meta({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-400 shrink-0">
        <Icon size={15} />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <div className="mt-0.5 text-sm text-slate-700">{children}</div>
      </div>
    </div>
  );
}

// Workflow actions rendered FROM the caller-specific allowed_transitions
// array — never from a hardcoded state machine, and never cached across
// users (contract §4.5). staff and system_admin always receive [], and a
// closed incident has no legal transitions (there is no reopen).
function WorkflowActions({ incident, onUpdated }) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState('');
  const allowed = incident.allowedTransitions;

  async function fire(toStatus, withNote) {
    setBusy(true);
    setError('');
    try {
      const updated = await transitionIncident(incident.id, {
        toStatus,
        note: withNote ? note.trim() : null,
      });
      setClosing(false);
      setNote('');
      onUpdated(updated);
    } catch (err) {
      // 409 invalid_transition carries the legal targets; 422
      // resolution_note_required means the close note is missing.
      setError(err?.message || 'The transition failed. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  if (allowed.length === 0) {
    return (
      <p className="text-[13px] text-slate-500">
        {incident.status === 'Closed'
          ? 'This incident is resolved and closed.'
          : 'No workflow actions are available for your role.'}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
          {error}
        </div>
      )}

      {allowed.includes('in_review') && (
        <>
          <p className="text-[13px] text-slate-500">
            This incident is awaiting triage. Moving it into review will assign it to you if
            it is unassigned.
          </p>
          <Button
            icon={ArrowRight}
            className="w-full"
            disabled={busy}
            onClick={() => fire('in_review', false)}
          >
            {busy ? 'Working…' : 'Move to In Review'}
          </Button>
        </>
      )}

      {allowed.includes('closed') && !closing && (
        <Button
          icon={CheckCircle2}
          variant={allowed.includes('in_review') ? 'secondary' : 'primary'}
          className="w-full"
          disabled={busy}
          onClick={() => setClosing(true)}
        >
          Close incident
        </Button>
      )}

      {allowed.includes('closed') && closing && (
        <div className="space-y-2">
          <Textarea
            id="resolution-note"
            label="Resolution note"
            hint="required to close"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What was done to resolve this incident?"
          />
          <div className="flex gap-2">
            <Button
              icon={CheckCircle2}
              className="flex-1"
              disabled={busy || note.trim() === ''}
              onClick={() => fire('closed', true)}
            >
              {busy ? 'Closing…' : 'Confirm close'}
            </Button>
            <Button variant="secondary" disabled={busy} onClick={() => { setClosing(false); setError(''); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Reassignment control — tenant_admin ONLY (contract §4.6: reviewer, staff
// and system_admin all get 403 on assign). Target must be an active reviewer.
// A no-op reassign still notifies and audits (D-11), so it is disabled when
// the selection matches the current assignee.
function AssignPanel({ incident, onUpdated }) {
  const [reviewers, setReviewers] = useState(null);
  const [selected, setSelected] = useState(incident.assignedTo?.id ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    listUsers({ role: 'reviewer', status: 'active', limit: 100 })
      .then(({ users }) => { if (active) setReviewers(users); })
      .catch(() => { if (active) setReviewers([]); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    setSelected(incident.assignedTo?.id ?? '');
  }, [incident.assignedTo?.id]);

  async function fire() {
    setBusy(true);
    setError('');
    try {
      onUpdated(await assignIncident(incident.id, selected));
    } catch (err) {
      // 409 incident_closed / 422 invalid_assignee — show the API's message.
      setError(err?.message || 'Reassignment failed.');
    } finally {
      setBusy(false);
    }
  }

  if (reviewers === null) return null;
  if (reviewers.length === 0) return null;

  const unchanged = selected === (incident.assignedTo?.id ?? '');
  return (
    <div className="space-y-2 border-t border-slate-100 pt-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Reassign</p>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
          {error}
        </div>
      )}
      <Select id="assignee" value={selected} onChange={(e) => setSelected(e.target.value)} aria-label="Assign to reviewer">
        <option value="" disabled>Select a reviewer…</option>
        {reviewers.map((r) => (
          <option key={r.id} value={r.id}>{r.name}</option>
        ))}
      </Select>
      <Button
        variant="secondary"
        className="w-full"
        disabled={busy || !selected || unchanged}
        onClick={fire}
      >
        {busy ? 'Assigning…' : 'Assign reviewer'}
      </Button>
    </div>
  );
}

export default function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useApp();
  const now = useNow(); // D-23: audit-trail relative times tick on screen
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getIncident(id)
      .then((data) => { if (active) setIncident(data); })
      .catch((err) => {
        // Absent, another tenant's, or outside the caller's visibility — the
        // API answers 404 for all three (tenant isolation, contract §2.10).
        if (active) setError(err?.status === 404 ? 'not_found' : err?.message || 'Failed to load.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  if (loading) {
    return (
      <Card className="flex items-center justify-center gap-2 py-16 text-sm text-slate-400">
        <Loader2 size={16} className="animate-spin" /> Loading incident…
      </Card>
    );
  }

  if (error === 'not_found' || !incident) {
    return (
      <Card className="p-10 text-center">
        <p className="text-sm text-slate-500">
          This incident was not found, or you do not have permission to view it.
        </p>
        <Link to="/incidents" className="mt-3 inline-block text-sm font-medium text-teal-brand hover:text-teal-dark">
          ← Back to incidents
        </Link>
      </Card>
    );
  }

  if (error) {
    return <Card className="py-14 text-center text-sm text-red-600">{error}</Card>;
  }

  return (
    <>
      <button
        onClick={() => navigate('/incidents')}
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
      >
        <ArrowLeft size={15} /> Back to incidents
      </button>

      <PageHeader title={incident.title} />

      <div className="-mt-3 mb-6 flex flex-wrap items-center gap-3">
        <Badge severity={incident.severity} dot />
        <Badge status={incident.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: details + workflow */}
        <div className="space-y-6 lg:col-span-2">
          <Card padded={false}>
            <CardHeader title="Description" />
            <div className="px-5 py-4">
              <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-line">{incident.description}</p>
            </div>
          </Card>

          <Card padded={false}>
            <CardHeader title="Details" />
            <div className="grid grid-cols-1 gap-x-8 px-5 py-2 sm:grid-cols-2">
              <Meta icon={Tag} label="Category">{incident.category}</Meta>
              <Meta icon={User} label="Reported by">
                {incident.submittedBy ? (
                  <span className="flex items-center gap-2">
                    <Avatar name={incident.submittedBy.name} size="xs" /> {incident.submittedBy.name}
                  </span>
                ) : '—'}
              </Meta>
              <Meta icon={UserCheck} label="Assigned to">
                {incident.assignedTo ? (
                  <span className="flex items-center gap-2">
                    <Avatar name={incident.assignedTo.name} size="xs" /> {incident.assignedTo.name}
                  </span>
                ) : (
                  <span className="text-slate-400 italic">Unassigned</span>
                )}
              </Meta>
              <Meta icon={Tag} label="Severity"><Badge severity={incident.severity} dot /></Meta>
              <Meta icon={CalendarPlus} label="Created">{formatDateTime(incident.createdAt)}</Meta>
              <Meta icon={CalendarClock} label="Last updated">{formatDateTime(incident.updatedAt)}</Meta>
            </div>
          </Card>

          <Card padded={false}>
            <CardHeader
              title="Workflow"
              subtitle="Open → In Review → Closed"
              actions={<Badge status={incident.status} />}
            />
            <div className="px-5 py-5 space-y-4">
              <WorkflowActions incident={incident} onUpdated={setIncident} />
              {role === 'Tenant Admin' && incident.status !== 'Closed' && (
                <AssignPanel incident={incident} onUpdated={setIncident} />
              )}
            </div>
          </Card>
        </div>

        {/* Right: audit trail timeline */}
        <div>
          <Card padded={false} className="lg:sticky lg:top-20">
            <CardHeader title="Activity & audit trail" actions={<History size={18} className="text-slate-300" />} />
            <div className="px-5 py-5">
              <ol className="relative space-y-6">
                <span className="absolute left-[7px] top-1 bottom-1 w-px bg-slate-200" aria-hidden />
                {incident.timeline.map((t) => {
                  const dot = STATUS_DOT[t.toState] ?? '#94A3B8';
                  return (
                    <li key={t.id} className="relative pl-7">
                      <span
                        className="absolute left-0 top-1 h-[15px] w-[15px] rounded-full border-2 border-white shadow"
                        style={{ backgroundColor: dot }}
                      />
                      <div className="flex flex-wrap items-center gap-1.5 text-[13px]">
                        {t.fromState ? (
                          <>
                            <Badge status={t.fromState} className="scale-90 origin-left" />
                            <ArrowRight size={12} className="text-slate-300" />
                            <Badge status={t.toState} className="scale-90 origin-left" />
                          </>
                        ) : (
                          <Badge status={t.toState} className="scale-90 origin-left" />
                        )}
                      </div>
                      {t.note && <p className="mt-1.5 text-[13px] text-slate-600">{t.note}</p>}
                      <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-400">
                        <Avatar name={t.byName} size="xs" className="!h-5 !w-5 !text-[9px]" />
                        <span className="font-medium text-slate-500">{t.byName}</span>
                        <span>·</span>
                        <span title={formatDateTime(t.at)}>{formatRelative(t.at, now)}</span>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
