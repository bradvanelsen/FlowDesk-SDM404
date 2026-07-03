import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
} from 'recharts';
import { ClipboardList, FolderOpen, Clock, CheckCircle2, PlusCircle, ArrowUpRight } from 'lucide-react';
import {
  PageHeader, StatCard, Card, CardHeader, Badge, Button,
  Table, THead, TH, TBody, TR, TD,
} from '../components/ui';
import { getDashboardStats, getIncidents } from '../data/mock';
import { formatDate } from '../lib/utils';

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-slate-700">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-slate-500">
          <span style={{ color: p.color || p.fill }}>●</span> {p.name}: <span className="font-medium text-slate-700">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const stats = getDashboardStats();
  const recent = [...getIncidents()]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of incident activity across Demo Organisation"
        actions={
          <Button icon={PlusCircle} onClick={() => navigate('/incidents/new')}>
            New incident
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Incidents" value={stats.total} icon={ClipboardList} accent="teal" hint="All time" />
        <StatCard label="Open" value={stats.byStatus.open} icon={FolderOpen} accent="blue" hint="Awaiting triage" />
        <StatCard label="In Review" value={stats.byStatus.inReview} icon={Clock} accent="amber" hint="Being actioned" />
        <StatCard label="Closed" value={stats.byStatus.closed} icon={CheckCircle2} accent="green" hint="Resolved" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" padded={false}>
          <CardHeader title="Incidents by week" subtitle="Last 8 weeks" />
          <div className="h-72 px-3 py-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.weekly} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F4" vertical={false} />
                <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(14,124,123,0.06)' }} />
                <Bar dataKey="incidents" name="Incidents" fill="#0E7C7B" radius={[6, 6, 0, 0]} maxBarSize={42} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card padded={false}>
          <CardHeader title="By status" />
          <div className="flex h-72 flex-col items-center justify-center px-4">
            <ResponsiveContainer width="100%" height="65%">
              <PieChart>
                <Pie
                  data={stats.statusSeries}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={48}
                  outerRadius={74}
                  paddingAngle={2}
                  stroke="none"
                >
                  {stats.statusSeries.map((s) => (
                    <Cell key={s.name} fill={s.color} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 flex w-full flex-col gap-1.5">
              {stats.statusSeries.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-[13px]">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.name}
                  </span>
                  <span className="font-semibold text-slate-800 tabular-nums">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card className="mt-6" padded={false}>
        <CardHeader
          title="Recent incidents"
          subtitle="Latest 5 reported"
          actions={
            <Button variant="ghost" size="sm" iconRight={ArrowUpRight} onClick={() => navigate('/incidents')}>
              View all
            </Button>
          }
        />
        <Table className="rounded-none border-0 shadow-none">
          <THead>
            <TR>
              <TH>Reference</TH>
              <TH>Title</TH>
              <TH>Severity</TH>
              <TH>Status</TH>
              <TH>Created</TH>
            </TR>
          </THead>
          <TBody>
            {recent.map((inc) => (
              <TR key={inc.id} onClick={() => navigate(`/incidents/${inc.reference}`)}>
                <TD className="font-medium text-teal-brand">{inc.reference}</TD>
                <TD className="max-w-xs truncate font-medium text-slate-800">{inc.title}</TD>
                <TD><Badge severity={inc.severity} dot /></TD>
                <TD><Badge status={inc.status} /></TD>
                <TD className="text-slate-500">{formatDate(inc.createdAt)}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </>
  );
}
