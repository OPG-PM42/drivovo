import { randomUUID } from 'node:crypto';
import type { CarCreate, CarUpdate } from '@drivovo/domain';
import type { CarService } from '../domain/services/car';

export const createCarEndpoint = (domain: { cars: CarService }) => [
  {
    path: '/',
    method: 'GET' as const,
    access: 'public' as const,
    handler: async (ctx: { query: Record<string, string> }) => {
      const params = {
        limit: ctx.query.limit ? Number(ctx.query.limit) : 20,
        offset: ctx.query.offset ? Number(ctx.query.offset) : 0,
        sortField: ctx.query.sortField as 'name' | 'brand' | 'status' | undefined,
        sortOrder: (ctx.query.sortOrder as 'asc' | 'desc') || 'asc',
      };
      const [items, total] = await Promise.all([
        domain.cars.getAll(params),
        domain.cars.count(params),
      ]);
      return { items, total };
    },
  },
  {
    path: '/:id',
    method: 'GET' as const,
    access: 'public' as const,
    errors: { NOT_FOUND: { code: 404, message: 'Car not found' } },
    handler: async (ctx: { params: { id: string } }) => {
      return domain.cars.getById(ctx.params.id);
    },
  },
  {
    path: '/',
    method: 'POST' as const,
    access: 'private' as const,
    errors: { UNKNOWN_ERROR: { code: 500, message: 'Failed to create car' } },
    handler: async (ctx: { body: CarCreate }) => {
      const body = ctx.body;
      const entity = {
        id: randomUUID(),
        name: body.name,
        brand: body.brand,
        description: body.description ?? '',
        driveType: body.driveType,
        type: body.type,
        status: body.status,
        images: body.images ?? [],
        engine: {
          type: body.engineType,
          capacity: body.engineCapacity ?? '',
          fuel_consumption: body.engineFuelCons ?? '',
        },
        interiorTrim: body.interiorTrim ?? '',
        acceleration: body.acceleration ?? '',
        power: body.power ?? '',
        color: body.color ?? '',
        url: body.url ?? '',
      };
      const id = await domain.cars.create(entity);
      return { id };
    },
  },
  {
    path: '/:id',
    method: 'PATCH' as const,
    access: 'private' as const,
    errors: {
      NOT_FOUND: { code: 404, message: 'Car not found' },
      UNKNOWN_ERROR: { code: 500, message: 'Failed to update car' },
    },
    handler: async (ctx: { params: { id: string }; body: CarUpdate }) => {
      const { id } = ctx.params;
      const body = ctx.body;
      const engine =
        body.engineType !== undefined || body.engineCapacity !== undefined || body.engineFuelCons !== undefined
          ? {
              type: body.engineType!,
              capacity: body.engineCapacity ?? '',
              fuel_consumption: body.engineFuelCons ?? '',
            }
          : undefined;
      const partial: Partial<import('@drivovo/domain').CarEntity> & { id: string } = {
        id,
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.brand !== undefined ? { brand: body.brand } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.driveType !== undefined ? { driveType: body.driveType } : {}),
        ...(body.type !== undefined ? { type: body.type } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
        ...(body.images !== undefined ? { images: body.images } : {}),
        ...(body.color != null ? { color: body.color } : {}),
        ...(body.interiorTrim != null ? { interiorTrim: body.interiorTrim } : {}),
        ...(body.acceleration != null ? { acceleration: body.acceleration } : {}),
        ...(body.power != null ? { power: body.power } : {}),
        ...(body.url != null ? { url: body.url } : {}),
        ...(engine ? { engine } : {}),
      };
      await domain.cars.update(partial);
      return { success: true };
    },
  },
  {
    path: '/:id',
    method: 'DELETE' as const,
    access: 'private' as const,
    errors: { NOT_FOUND: { code: 404, message: 'Car not found' } },
    handler: async (ctx: { params: { id: string } }) => {
      await domain.cars.delete(ctx.params.id);
      return { success: true };
    },
  },
];
