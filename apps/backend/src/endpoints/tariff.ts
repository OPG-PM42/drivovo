import { randomUUID } from 'node:crypto';
import type { TariffCreate, TariffUpdate } from '@drivovo/domain';
import type { TariffService } from '../domain/services/tariff';

export const createTariffEndpoint = (domain: { tariffs: TariffService }) => [
  {
    path: '/',
    method: 'GET' as const,
    access: 'public' as const,
    handler: async (ctx: { query: Record<string, string> }) => {
      const params = {
        limit: ctx.query.limit ? Number(ctx.query.limit) : 20,
        offset: ctx.query.offset ? Number(ctx.query.offset) : 0,
        sortField: ctx.query.sortField as 'name' | 'type' | undefined,
        sortOrder: (ctx.query.sortOrder as 'asc' | 'desc') || 'asc',
        ...(ctx.query.type ? { type: ctx.query.type as 'leasing' | 'subscription' } : {}),
      };
      const items = await domain.tariffs.getAll(params);
      const total = items.length;
      return { items, total };
    },
  },
  {
    path: '/:id',
    method: 'GET' as const,
    access: 'public' as const,
    errors: { NOT_FOUND: { code: 404, message: 'Tariff not found' } },
    handler: async (ctx: { params: { id: string } }) => {
      return domain.tariffs.getById(ctx.params.id);
    },
  },
  {
    path: '/',
    method: 'POST' as const,
    access: 'private' as const,
    errors: { UNKNOWN_ERROR: { code: 500, message: 'Failed to create tariff' } },
    handler: async (ctx: { body: TariffCreate }) => {
      const body = ctx.body;
      const entity = {
        id: randomUUID(),
        ...body,
        options: body.options ?? [],
      };
      const id = await domain.tariffs.create(entity);
      return { id };
    },
  },
  {
    path: '/:id',
    method: 'PATCH' as const,
    access: 'private' as const,
    errors: {
      NOT_FOUND: { code: 404, message: 'Tariff not found' },
      UNKNOWN_ERROR: { code: 500, message: 'Failed to update tariff' },
    },
    handler: async (ctx: { params: { id: string }; body: TariffUpdate }) => {
      const { id } = ctx.params;
      const body = ctx.body;
      await domain.tariffs.update({ ...body, id } as Parameters<TariffService['update']>[0]);
      return { success: true };
    },
  },
  {
    path: '/:id',
    method: 'DELETE' as const,
    access: 'private' as const,
    errors: { NOT_FOUND: { code: 404, message: 'Tariff not found' } },
    handler: async (ctx: { params: { id: string } }) => {
      await domain.tariffs.delete(ctx.params.id);
      return { success: true };
    },
  },
];
