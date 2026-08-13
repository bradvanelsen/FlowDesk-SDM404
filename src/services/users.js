// User service (contract §4.4). Every endpoint here is gated to
// tenant_admin + system_admin — call only from UI those roles can reach, or
// the API answers 403 insufficient_role.
import { api } from './api';
import { roleLabel, statusLabel } from '../lib/roles';

function adaptUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: roleLabel(u.role),
    apiRole: u.role,
    status: statusLabel(u.status),
    apiStatus: u.status,
    createdAt: u.created_at,
  };
}

export async function listUsers(params = {}) {
  const { data, pagination } = await api.getList('/users', params);
  return { users: data.map(adaptUser), pagination };
}

// Invite a user (POST /users): creates the Supabase auth user and the
// FlowDesk row, and Supabase emails a set-password link (§2.6) — a REAL email
// that counts against the shared hourly quota; coordinate before calling.
// The created user is always status active — the API has NO pending state.
// role is an API value; granting system_admin from a non-System-Admin is a
// 403 privilege_escalation at runtime.
export async function inviteUser({ email, name, role }) {
  return adaptUser(await api.post('/users', { email, name, role }));
}

// Only name and role are patchable; we wire role. 200 → full UserOut.
export async function changeRole(id, role) {
  return adaptUser(await api.patch(`/users/${id}`, { role }));
}

// Both idempotent; 200 with the full updated UserOut (not 204).
// NOTE the contract's D-3 warning: the API has NO self/sole-admin guard —
// the UI must block deactivating the last active tenant_admin BEFORE calling.
export async function deactivateUser(id) {
  return adaptUser(await api.post(`/users/${id}/deactivate`));
}

export async function activateUser(id) {
  return adaptUser(await api.post(`/users/${id}/activate`));
}
