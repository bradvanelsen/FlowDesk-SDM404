// Category service (contract §4.3). Read scope: caller's own tenant, always.
import { api } from './api';

export async function listCategories(params = {}) {
  const { data, pagination } = await api.getList('/categories', params);
  return {
    categories: data.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      createdAt: c.created_at,
    })),
    pagination,
  };
}
