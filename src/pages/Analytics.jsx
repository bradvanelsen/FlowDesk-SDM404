import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell,
} from 'recharts';
import { TrendingUp, Timer, AlertTriangle, CheckCircle2 } from 'lucide-react';
import {
  PageHeader, Card, CardHeader, StatCard, Select, SEVERITY_DOT, STATUS_DOT,
} from '../components/ui';
import { getDashboardStats } from '../data/mock';

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      {label && <p className="mb-0.5 font-semibold text-slate-700">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} className="text-slate-500">
          <span style={{ color: p.color || p.fill }}>●</span> {p.name}:{' '}
          <span className="font-medium text-slate-700">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const stats = getDashboardStats();
  const closureRate = Math.round((stats.byStatus.closed / stats.total) * 100);

  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle="Incident trends and resolution performance"
        actions={
          <div className="flex items-center gap-2.5">
            <div className="w-44">
              <Select size="sm" defaultValue="Last 8 weeks" aria-label="Date range">
                <option>Last 4 weeks</option>
                <option>Last 8 weeks</option>
                <option>Last quarter</option>
                <option>Year to date</option>
              </Select>
            </div>
            <div className="w-40">
              <Select size="sm" defaultValue="All severities" aria-label="Severity filter">
                <option>All severities</option>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </Select>
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Reported this month" value={stats.totalThisMonth} icon={TrendingUp} accent="teal" hint="June 2026" />
        <StatCard label="Avg. resolution time" value={`${stats.avgResolutionDays}d`} icon={Timer} accent="blue" hint="From open to closed" />
        <StatCard label="Open critical" value={stats.openCritical} icon={AlertTriangle} accent="red" hint="Needs attention" />
        <StatCard label="Closure rate" value={`${closureRate}%`} icon={CheckCircle2} accent="green" hint="Of all incidents" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" padded={false}>
          <CardHeader title="Incident volume" subtitle="Reported per week — last 8 weeks" />
          <div className="h-72 px-3 py-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.weekly} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="vol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0E7C7B" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#0E7C7B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F4" vertical={false} />
                <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="incidents" name="Incidents" stroke="#0E7C7B" strokeWidth={2.5} fill="url(#vol)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card padded={false}>
          <CardHeader title="Status by week" subtitle="Stacked distribution" />
          <div className="h-72 px-3 py-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.weekly} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F4" vertical={false} />
                <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} interval={1} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(14,124,123,0.06)' }} />
                <Bar dataKey="Open" stackId="s" fill={STATUS_DOT.Open} radius={[0, 0, 0, 0]} maxBarSize={26} />
                <Bar dataKey="In Review" stackId="s" fill={STATUS_DOT['In Review']} maxBarSize={26} />
                <Bar dataKey="Closed" stackId="s" fill={STATUS_DOT.Closed} radius={[4, 4, 0, 0]} maxBarSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 pb-4 text-xs text-slate-500">
            {['Open', 'In Review', 'Closed'].map((s) => (
              <span key={s} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STATUS_DOT[s] }} />
                {s}
              </span>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card padded={false}>
          <CardHeader title="By severity" subtitle="All incidents" />
          <div className="h-64 px-3 py-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.bySeverity} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F4" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(14,124,123,0.06)' }} />
                <Bar dataKey="value" name="Incidents" radius={[6, 6, 0, 0]} maxBarSize={56}>
                  {stats.bySeverity.map((s) => (
                    <Cell key={s.name} fill={SEVERITY_DOT[s.name]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card padded={false}>
          <CardHeader title="By category" subtitle="All incidents" />
          <div className="h-64 px-3 py-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.byCategory}
                layout="vertical"
                margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F4" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                <YAxis type="category" dataKey="name" width={104} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(14,124,123,0.06)' }} />
                <Bar dataKey="value" name="Incidents" fill="#0E7C7B" radius={[0, 6, 6, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </>
  );
}
