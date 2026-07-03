import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, CheckCircle2, RotateCcw, Undo2, History,
  Tag, User, UserCheck, CalendarPlus, CalendarClock,
} from 'lucide-react';
import {
  PageHeader, Card, CardHeader, Button, Badge, Avatar, STATUS_DOT,
} from '../components/ui';
import { getIncidentByRef, getTransitionsForIncident, getUserById } from '../data/mock';
import { formatDateTime, formatRelative } from '../lib/utils';

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

// State-aware workflow actions for Open → In Review → Closed.
function WorkflowActions({ status }) {
  const next = {
    Open: (
      <>
        <p className="text-[13px] text-slate-500">
          This incident is awaiting triage. Move it into review to begin working on it.
        </p>
        <Button icon={ArrowRight} className="w-full">Move to In Review</Button>
      </>
    ),
    'In Review': (
      <>
        <p className="text-[13px] text-slate-500">
          This incident is being actioned. Close it once resolved, or return it to the queue.
        </p>
        <Button icon={CheckCircle2} className="w-full">Close incident</Button>
        <Button variant="secondary" icon={Undo2} className="w-full">Return to Open</Button>
      </>
    ),
    Closed: (
      <>
        <p className="text-[13px] text-slate-500">
          This incident is resolved and closed. Reopen it if the issue recurs.
        </p>
        <Button variant="secondary" icon={RotateCcw} className="w-full">Reopen incident</Button>
      </>
    ),
  };
  return <div className="space-y-3">{next[status]}</div>;
}

export default function IncidentDetail() {
  const { ref } = useParams();
  const navigate = useNavigate();
  const incident = getIncidentByRef(ref);

  if (!incident) {
    return (
      <Card className="p-10 text-center">
        <p className="text-sm text-slate-500">Incident <span className="font-medium">{ref}</span> was not found.</p>
        <Link to="/incidents" className="mt-3 inline-block text-sm font-medium text-teal-brand hover:text-teal-dark">
          ← Back to incidents
        </Link>
      </Card>
    );
  }

  const creator = getUserById(incident.createdBy);
  const assignee = getUserById(incident.assignedTo);
  const transitions = getTransitionsForIncident(incident.id);

  return (
    <>
      <button
        onClick={() => navigate('/incidents')}
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
      >
        <ArrowLeft size={15} /> Back to incidents
      </button>

      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <span className="text-teal-brand">{incident.reference}</span>
          </span>
        }
      />

      <div className="-mt-3 mb-6 flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold text-slate-800">{incident.title}</h2>
        <Badge severity={incident.severity} dot />
        <Badge status={incident.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: details + workflow */}
        <div className="space-y-6 lg:col-span-2">
          <Card padded={false}>
            <CardHeader title="Description" />
            <div className="px-5 py-4">
              <p className="text-sm leading-relaxed text-slate-600">{incident.description}</p>
            </div>
          </Card>

          <Card padded={false}>
            <CardHeader title="Details" />
            <div className="grid grid-cols-1 gap-x-8 px-5 py-2 sm:grid-cols-2">
              <Meta icon={Tag} label="Category">{incident.category}</Meta>
              <Meta icon={User} label="Reported by">
                {creator ? (
                  <span className="flex items-center gap-2">
                    <Avatar name={creator.name} size="xs" /> {creator.name}
                  </span>
                ) : '—'}
              </Meta>
              <Meta icon={UserCheck} label="Assigned to">
                {assignee ? (
                  <span className="flex items-center gap-2">
                    <Avatar name={assignee.name} size="xs" /> {assignee.name}
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
            <div className="px-5 py-5">
              <WorkflowActions status={incident.status} />
            </div>
          </Card>
        </div>

        {/* Right: audit trail timeline */}
        <div>
          <Card padded={false} className="lg:sticky lg:top-20">
            <CardHeader title="Activity & audit trail" actions={<History size={18} className="text-slate-300" />} />
            <div className="px-5 py-5">
              <ol className="relative space-y-6">
                {/* connector line */}
                <span className="absolute left-[7px] top-1 bottom-1 w-px bg-slate-200" aria-hidden />
                {transitions.map((t) => {
                  const by = getUserById(t.byUser);
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
                      <p className="mt-1.5 text-[13px] text-slate-600">{t.note}</p>
                      <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-400">
                        {by && <Avatar name={by.name} size="xs" className="!h-5 !w-5 !text-[9px]" />}
                        <span className="font-medium text-slate-500">{by ? by.name : 'System'}</span>
                        <span>·</span>
                        <span title={formatDateTime(t.at)}>{formatRelative(t.at)}</span>
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
