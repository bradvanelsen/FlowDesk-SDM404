import { useEffect, useState } from 'react';
import { UserPlus, Shield, UserX, Loader2, AlertTriangle } from 'lucide-react';
import {
  PageHeader, Card, Button, Avatar, Modal, Input, Select,
  Table, THead, TH, TBody, TR, TD,
} from '../components/ui';
import { useApp } from '../context/AppContext';
import {
  listUsers, inviteUser, changeRole, deactivateUser, activateUser,
} from '../services/users';
import { fieldErrorsFrom } from '../services/api';
import { ROLE_LABELS } from '../lib/roles';
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

// API field names → invite-form state keys, for 422 envelope mapping.
const INVITE_FIELD_MAP = { email: 'email', name: 'name', role: 'role' };
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Users() {
  const { currentUser, role: myRole } = useApp();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [opError, setOpError] = useState('');
  const [notice, setNotice] = useState('');
  const [busyId, setBusyId] = useState(null);

  // Invite modal
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invite, setInvite] = useState({ name: '', email: '', role: 'staff' });
  const [inviteErrors, setInviteErrors] = useState({});
  const [inviteFormError, setInviteFormError] = useState('');
  const [inviteBusy, setInviteBusy] = useState(false);

  // Change-role modal: { user } + working value
  const [roleTarget, setRoleTarget] = useState(null);
  const [roleValue, setRoleValue] = useState('staff');
  const [roleBusy, setRoleBusy] = useState(false);
  const [roleError, setRoleError] = useState('');

  // D-3 guard dialog: { type: 'last-admin' | 'self', user }
  const [guard, setGuard] = useState(null);

  // Granting system_admin is a 403 privilege_escalation unless the caller is
  // a System Admin — don't offer what the API will refuse.
  const roleOptions = Object.entries(ROLE_LABELS)
    .filter(([api]) => api !== 'system_admin' || myRole === 'System Admin');

  useEffect(() => {
    let active = true;
    listUsers({ limit: 100 })
      .then(({ users: rows }) => { if (active) setUsers(rows); })
      .catch((err) => {
        if (!active) return;
        setLoadError(
          err?.status === 403
            ? 'Only administrators can view users.'
            : err?.message || 'Could not load users.',
        );
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const replaceUser = (u) => setUsers((prev) => prev.map((x) => (x.id === u.id ? u : x)));
  const flashNotice = (text) => {
    setNotice(text);
    setTimeout(() => setNotice(''), 5000);
  };

  // ── Invite ────────────────────────────────────────────────────────────
  async function submitInvite(e) {
    e.preventDefault();
    if (inviteBusy) return;
    setInviteFormError('');
    const errs = {};
    if (!invite.name.trim()) errs.name = 'Please enter a full name.';
    if (!EMAIL_SHAPE.test(invite.email.trim())) errs.email = 'Please enter a valid email address.';
    setInviteErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setInviteBusy(true);
    try {
      const created = await inviteUser({
        email: invite.email.trim(),
        name: invite.name.trim(),
        role: invite.role,
      });
      // The API has no pending state — the invited user is active immediately;
      // they just can't sign in until the emailed set-password link is used.
      setUsers((prev) => [...prev, created]);
      setInviteOpen(false);
      setInvite({ name: '', email: '', role: 'staff' });
      flashNotice(`Invitation sent to ${created.email}.`);
    } catch (err) {
      if (err?.status === 422) {
        const mapped = fieldErrorsFrom(err, INVITE_FIELD_MAP);
        setInviteErrors(mapped);
        setInviteFormError(mapped._form ?? (Object.keys(mapped).length ? '' : err.message));
      } else if (err?.status === 409 || err?.status === 403) {
        // 409 duplicate-email and 403 privilege_escalation both carry precise
        // API messages — show them verbatim.
        setInviteFormError(err.message);
      } else if (err?.status >= 500) {
        setInviteFormError('Something went wrong on our side. Invites send a real email — coordinate before retrying.');
      } else {
        setInviteFormError(err?.message || 'The invitation failed. Please try again.');
      }
    } finally {
      setInviteBusy(false);
    }
  }

  // ── Role change ───────────────────────────────────────────────────────
  function openRoleModal(u) {
    setRoleTarget(u);
    setRoleValue(u.apiRole);
    setRoleError('');
  }

  async function submitRole() {
    if (roleBusy || !roleTarget) return;
    setRoleBusy(true);
    setRoleError('');
    try {
      replaceUser(await changeRole(roleTarget.id, roleValue));
      setRoleTarget(null);
    } catch (err) {
      setRoleError(err?.message || 'The role change failed.');
    } finally {
      setRoleBusy(false);
    }
  }

  // ── Deactivate / reactivate with the D-3 guard ───────────────────────
  function requestDeactivate(u) {
    // D-3 (contract §4.4): the backend has NO guard — deactivating the last
    // active Tenant Admin permanently locks the organisation out. Block it
    // client-side, before any API call. Checked FIRST so a sole admin
    // clicking their own row gets the block, not the softer self-confirm.
    const activeAdmins = users.filter(
      (x) => x.apiRole === 'tenant_admin' && x.apiStatus === 'active',
    );
    if (u.apiRole === 'tenant_admin' && u.apiStatus === 'active' && activeAdmins.length <= 1) {
      setGuard({ type: 'last-admin', user: u });
      return;
    }
    if (u.id === currentUser?.id) {
      setGuard({ type: 'self', user: u });
      return;
    }
    fireStatus(u, deactivateUser);
  }

  async function fireStatus(u, fn) {
    setBusyId(u.id);
    setOpError('');
    try {
      replaceUser(await fn(u.id));
    } catch (err) {
      setOpError(err?.message || 'The status change failed.');
    } finally {
      setBusyId(null);
    }
  }

  const activeCount = users.filter((u) => u.apiStatus === 'active').length;

  return (
    <>
      <PageHeader
        title="Users"
        subtitle={loading ? 'Loading…' : `${activeCount} active member${activeCount === 1 ? '' : 's'} in this workspace`}
        actions={
          <div className="flex items-center gap-3">
            {notice && <span className="text-[13px] font-medium text-green-700">{notice}</span>}
            <Button icon={UserPlus} onClick={() => setInviteOpen(true)}>Invite user</Button>
          </div>
        }
      />

      {opError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
          {opError}
        </div>
      )}

      {loading ? (
        <Card className="flex items-center justify-center gap-2 py-14 text-sm text-slate-400">
          <Loader2 size={16} className="animate-spin" /> Loading users…
        </Card>
      ) : loadError ? (
        <Card className="py-14 text-center text-sm text-red-600">{loadError}</Card>
      ) : (
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
                const deactivated = u.apiStatus === 'inactive';
                const busy = busyId === u.id;
                return (
                  <TR key={u.id} muted={deactivated}>
                    <TD>
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} size="sm" />
                        <span className="font-medium text-slate-800">
                          {u.name}
                          {u.id === currentUser?.id && (
                            <span className="ml-1.5 text-[11px] font-normal text-slate-400">(you)</span>
                          )}
                        </span>
                      </div>
                    </TD>
                    <TD className="text-slate-500">{u.email}</TD>
                    <TD><RoleBadge role={u.role} /></TD>
                    <TD><StatusBadge status={u.status} /></TD>
                    <TD align="right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="secondary" size="sm" icon={Shield} disabled={busy} onClick={() => openRoleModal(u)}>
                          Change role
                        </Button>
                        {deactivated ? (
                          <Button variant="secondary" size="sm" disabled={busy} onClick={() => fireStatus(u, activateUser)}>
                            {busy ? 'Working…' : 'Reactivate'}
                          </Button>
                        ) : (
                          <Button variant="danger" size="sm" icon={UserX} disabled={busy} onClick={() => requestDeactivate(u)}>
                            {busy ? 'Working…' : 'Deactivate'}
                          </Button>
                        )}
                      </div>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
          {users.length === 0 && (
            <div className="py-14 text-center text-sm text-slate-400">No users yet.</div>
          )}
        </Card>
      )}

      {/* Invite modal — sends a REAL Supabase email on success */}
      <Modal
        open={inviteOpen}
        onClose={() => { if (!inviteBusy) setInviteOpen(false); }}
        title="Invite user"
        subtitle="They'll receive an email invitation to set a password and join this workspace."
        footer={
          <>
            <Button variant="secondary" disabled={inviteBusy} onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button disabled={inviteBusy} onClick={submitInvite}>
              {inviteBusy ? 'Sending…' : 'Send invite'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {inviteFormError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
              {inviteFormError}
            </div>
          )}
          <div>
            <Input
              id="invite-name" label="Full name" placeholder="e.g. Jordan Smith"
              value={invite.name} onChange={(e) => setInvite((f) => ({ ...f, name: e.target.value }))}
            />
            {inviteErrors.name && <p className="mt-1 text-[12px] text-red-600">{inviteErrors.name}</p>}
          </div>
          <div>
            <Input
              id="invite-email" label="Email" type="email" placeholder="name@organisation.au"
              value={invite.email} onChange={(e) => setInvite((f) => ({ ...f, email: e.target.value }))}
            />
            {inviteErrors.email && <p className="mt-1 text-[12px] text-red-600">{inviteErrors.email}</p>}
          </div>
          <div>
            <Select
              id="invite-role" label="Role"
              value={invite.role} onChange={(e) => setInvite((f) => ({ ...f, role: e.target.value }))}
            >
              {roleOptions.map(([api, label]) => (
                <option key={api} value={api}>{label}</option>
              ))}
            </Select>
            {inviteErrors.role && <p className="mt-1 text-[12px] text-red-600">{inviteErrors.role}</p>}
          </div>
        </div>
      </Modal>

      {/* Change-role modal */}
      <Modal
        open={roleTarget !== null}
        onClose={() => { if (!roleBusy) setRoleTarget(null); }}
        title={`Change role — ${roleTarget?.name ?? ''}`}
        subtitle="Takes effect on the user's next request."
        footer={
          <>
            <Button variant="secondary" disabled={roleBusy} onClick={() => setRoleTarget(null)}>Cancel</Button>
            <Button disabled={roleBusy || roleValue === roleTarget?.apiRole} onClick={submitRole}>
              {roleBusy ? 'Saving…' : 'Save role'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {roleError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
              {roleError}
            </div>
          )}
          <Select id="role-change" label="Role" value={roleValue} onChange={(e) => setRoleValue(e.target.value)}>
            {roleOptions.map(([api, label]) => (
              <option key={api} value={api}>{label}</option>
            ))}
          </Select>
        </div>
      </Modal>

      {/* D-3 guard dialogs */}
      <Modal
        open={guard !== null}
        onClose={() => setGuard(null)}
        title={guard?.type === 'last-admin' ? 'This would lock the organisation out' : 'Deactivate your own account?'}
        footer={
          guard?.type === 'last-admin' ? (
            <Button onClick={() => setGuard(null)}>Understood</Button>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setGuard(null)}>Cancel</Button>
              <Button
                variant="danger"
                onClick={() => { const u = guard.user; setGuard(null); fireStatus(u, deactivateUser); }}
              >
                Deactivate my account
              </Button>
            </>
          )
        }
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <AlertTriangle size={18} />
          </span>
          {guard?.type === 'last-admin' ? (
            <p className="text-sm leading-relaxed text-slate-600">
              <span className="font-medium text-slate-800">{guard?.user?.name}</span> is the only
              active Tenant Admin in this organisation. Deactivating the last administrator would
              permanently lock the organisation out of FlowDesk — there is no self-service
              recovery (defect D-3). Add another Tenant Admin first. No change has been made.
            </p>
          ) : (
            <p className="text-sm leading-relaxed text-slate-600">
              You are about to deactivate <span className="font-medium text-slate-800">your own
              account</span>. It takes effect on your very next request: you will be signed out
              immediately and cannot reactivate yourself — another administrator would have to do it.
            </p>
          )}
        </div>
      </Modal>
    </>
  );
}
