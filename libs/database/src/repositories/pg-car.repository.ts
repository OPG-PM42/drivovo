import type { Pool } from 'pg';
import type { CarEntity } from '../../../domain/src/entities';
import type { CarRepository, CarSearchParams } from '../../../domain/src/repositories';
import { Query } from '../client/query-builder';

export const createCarRepository = (pool: Pool): CarRepository => ({

  async find(params: CarSearchParams): Promise<CarEntity[]> {
    const query = new Query('cars');
    if (Object.keys(params).length > 0) {
      query.where(params as Record<string, string | number | undefined>);
    }
    const sql = await query;
    const result = await pool.query(sql);
    return result.rows;
  },

  async findOne(id: string): Promise<CarEntity> {
    throw new Error('Not implemented');
  },

  async findByUrl(url: string): Promise<CarEntity> {
    throw new Error('Not implemented');
  },

  async insert(entity: CarEntity): Promise<string> {
    throw new Error('Not implemented');
  },

  async update(id: string, data: Partial<CarEntity>): Promise<void> {
    throw new Error('Not implemented');
  },

  async delete(id: string): Promise<void> {
    throw new Error('Not implemented');
  },
});
