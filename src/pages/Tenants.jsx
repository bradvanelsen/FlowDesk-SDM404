import { useState } from 'react';
import { Building2, Plus, Users as UsersIcon, CircleCheck, MoreHorizontal } from 'lucide-react';
import {
  PageHeader, Card, Button, Badge, StatCard, Modal, Input, Select,
  Table, THead, TH, TBody, TR, TD,
} from '../components/ui';
import { getTenants, getUsers } from '../data/mock';
import { formatDate, cn } from '../lib/utils';

// Display-only seat counts for the System Admin oversight view.
const SEATS = { 't-001': null, 't-002': 12, 't-003': 7 };

export default function Tenants() {
  const tenants = getTenants();
  const realUsers = getUsers().length;
  const [addOpen, setAddOpen] = useState(false);

  const seatsFor = (id) => (SEATS[id] == null ? realUsers : SEATS[id]);
  const totalSeats = tenants.reduce((s, t) => s + seatsFor(t.id), 0);

  return (
    <>
      <PageHeader
        title="Tenants"
        subtitle="Manage organisations on the FlowDesk platform"
        actions={<Button icon={Plus} onClick={() => setAddOpen(true)}>Add tenant</Button>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Tenants" value={tenants.length} icon={Building2} accent="teal" />
        <StatCard label="Active" value={tenants.length} icon={CircleCheck} accent="green" hint="All in good standing" />
        <StatCard label="Total Users" value={totalSeats} icon={UsersIcon} accent="blue" hint="Across all tenants" />
      </div>

      <Card className="mt-6" padded={false}>
        <Table className="rounded-none border-0 shadow-none">
          <THead>
            <TR>
              <TH>Organisation</TH>
              <TH>Plan</TH>
              <TH align="center">Users</TH>
              <TH>Status</TH>
              <TH>Created</TH>
              <TH align="right">Actions</TH>
            </TR>
          </THead>
          <TBody>
            {tenants.map((t) => (
              <TR key={t.id}>
                <TD>
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-light text-teal-brand font-semibold">
                      {t.name.charAt(0)}
                    </span>
                    <div>
                      <p className="font-medium text-slate-800">{t.name}</p>
                      <p className="text-xs text-slate-400">{t.id}</p>
                    </div>
                  </div>
                </TD>
                <TD>
                  <span className={cn(
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
                    t.plan === 'Pro' ? 'bg-teal-light text-teal-dark ring-teal-mid' : 'bg-slate-100 text-slate-600 ring-slate-200',
                  )}>
                    {t.plan}
                  </span>
                </TD>
                <TD align="center" className="tabular-nums font-medium text-slate-700">{seatsFor(t.id)}</TD>
                <TD>
                  <Badge tone="neutral" className="bg-green-50 text-green-700 ring-green-200">Active</Badge>
                </TD>
                <TD className="text-slate-500">{formatDate(t.createdAt)}</TD>
                <TD align="right">
                  <Button variant="ghost" size="sm" icon={MoreHorizontal} aria-label="More" />
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add tenant"
        subtitle="Provision a new organisation on the platform."
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => setAddOpen(false)}>Create tenant</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input id="t-name" label="Organisation name" placeholder="e.g. Acme Corporation" />
          <Select id="t-plan" label="Plan" defaultValue="Pro">
            <option>Basic</option>
            <option>Pro</option>
          </Select>
        </div>
      </Modal>
    </>
  );
}
