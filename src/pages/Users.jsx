import { useState } from 'react';
import { UserPlus, Shield, UserX } from 'lucide-react';
import {
  PageHeader, Card, Button, Avatar, Badge, Modal, Input, Select,
  Table, THead, TH, TBody, TR, TD,
} from '../components/ui';
import { getUsers } from '../data/mock';
import { cn } from '../lib/utils';

const ROLE_TONE = {
  'System Admin': 'bg-teal-brand/10 text-teal-dark ring-teal-mid',
  'Tenant Admin': 'bg-teal-light text-teal-dark ring-teal-mid',
  Reviewer: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  Staff: 'bg-slate-100 text-slate-600 ring-slate-200',
};

function RoleBadge({ role }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset', ROLE_TONE[role])}>
      {role}
    </span>
  );
}

function StatusBadge({ status }) {
  const active = status === 'Active';
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
      active ? 'bg-green-50 text-green-700 ring-green-200' : 'bg-slate-100 text-slate-400 ring-slate-200',
    )}>
      <span className={cn('h-1.5 w-1.5 rounded-full', active ? 'bg-green-500' : 'bg-slate-300')} />
      {status}
    </span>
  );
}

export default function Users() {
  const users = getUsers();
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Users"
        subtitle={`${users.filter((u) => u.status === 'Active').length} active members in this workspace`}
        actions={<Button icon={UserPlus} onClick={() => setInviteOpen(true)}>Invite user</Button>}
      />

      <Card padded={false}>
        <Table className="rounded-none border-0 shadow-none">
          <THead>
            <TR>
              <TH>Name</TH>
              <TH>Email</TH>
              <TH>Role</TH>
              <TH>Status</TH>
              <TH align="right">Actions</TH>
            </TR>
          </THead>
          <TBody>
            {users.map((u) => {
              const deactivated = u.status === 'Deactivated';
              return (
                <TR key={u.id} muted={deactivated}>
                  <TD>
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} size="sm" />
                      <span className="font-medium text-slate-800">{u.name}</span>
                    </div>
                  </TD>
                  <TD className="text-slate-500">{u.email}</TD>
                  <TD><RoleBadge role={u.role} /></TD>
                  <TD><StatusBadge status={u.status} /></TD>
                  <TD align="right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="secondary" size="sm" icon={Shield}>Assign role</Button>
                      {deactivated ? (
                        <Button variant="secondary" size="sm">Reactivate</Button>
                      ) : (
                        <Button variant="danger" size="sm" icon={UserX}>Deactivate</Button>
                      )}
                    </div>
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      </Card>

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite user"
        subtitle="They'll receive an email invitation to join Demo Organisation."
        footer={
          <>
            <Button variant="secondary" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button onClick={() => setInviteOpen(false)}>Send invite</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input id="invite-name" label="Full name" placeholder="e.g. Jordan Smith" />
          <Input id="invite-email" label="Email" type="email" placeholder="name@demoorg.example" />
          <Select id="invite-role" label="Role" defaultValue="Staff">
            <option>System Admin</option>
            <option>Tenant Admin</option>
            <option>Staff</option>
            <option>Reviewer</option>
          </Select>
        </div>
      </Modal>
    </>
  );
}
