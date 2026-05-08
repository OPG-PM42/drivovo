import type { SessionEntity } from '@drivovo/domain';
import db from '../infrastructure/database';
import {
  createSessionEntity,
  createSessionTable,
} from '../infrastructure/database/tables';
import { RepositoryError } from './repository';

export interface SessionRepository {
  findByToken(token: string): Promise<SessionEntity | null>;
  insert(entity: Omit<SessionEntity, 'createdAt'>): Promise<string | null>;
  delete(token: string): Promise<string | null>;
  deleteExpired(): Promise<number>;
}

export default {
  async findByToken(token: string): Promise<SessionEntity | null> {
    try {
      const row = await db
        .selectFrom('sessions')
        .selectAll()
        .where('token', '=', token)
        .executeTakeFirst();
      return row ? createSessionEntity(row) : null;
    } catch (error) {
      throw RepositoryError.from(error);
    }
  },

  async insert(entity: Omit<SessionEntity, 'createdAt'>): Promise<string | null> {
    try {
      const result = await db
        .insertInto('sessions')
        .values(createSessionTable(entity))
        .returning('token')
        .executeTakeFirst();
      return result?.token ?? null;
    } catch (error) {
      throw RepositoryError.from(error);
    }
  },

  async delete(token: string): Promise<string | null> {
    try {
      const result = await db
        .deleteFrom('sessions')
        .where('token', '=', token)
        .returning('token')
        .executeTakeFirst();
      return result?.token ?? null;
    } catch (error) {
      throw RepositoryError.from(error);
    }
  },

  async deleteExpired(): Promise<number> {
    try {
      const result = await db
        .deleteFrom('sessions')
        .where('expires_at', '<', new Date())
        .executeTakeFirst();
      return Number(result.numDeletedRows ?? 0);
    } catch (error) {
      throw RepositoryError.from(error);
    }
  },
} satisfies SessionRepository;
