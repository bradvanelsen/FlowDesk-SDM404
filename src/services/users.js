// User service (contract §4.4). List/read is tenant_admin + system_admin only
// — call this only from UI that those roles can see (e.g. the assign control),
// or the API answers 403 insufficient_role.
import { api } from './api';
import { roleLabel, statusLabel } from '../lib/roles';

export async function listUsers(params = {}) {
  const { data, pagination } = await api.getList('/users', params);
  return {
    users: data.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: roleLabel(u.role),
      apiRole: u.role,
      status: statusLabel(u.status),
      apiStatus: u.status,
      createdAt: u.created_at,
    })),
    pagination,
  };
}
