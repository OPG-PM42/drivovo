import type { AdminEntity } from '@drivovo/domain';
import db from '../infrastructure/database';
import {
  createAdminEntity,
  createAdminTable,
  createAdminUpdates,
} from '../infrastructure/database/tables';
import { type Repository, type SearchParams, RepositoryError } from './repository';

const SORT_FIELD_MAP = {
  email: 'email',
  name: 'name',
  role: 'role',
  created_at: 'created_at',
} as const;

type AdminSearchParams = SearchParams<keyof typeof SORT_FIELD_MAP>;

export interface AdminRepository extends Repository<AdminEntity, AdminSearchParams> {
  findByEmail(email: string): Promise<AdminEntity | null>;
}

export default {
  async find(params: AdminSearchParams = {}): Promise<AdminEntity[]> {
    try {
      const rows = await db
        .selectFrom('admins')
        .selectAll()
        .$if(Boolean(params?.sortField && SORT_FIELD_MAP[params.sortField!]), (query) =>
          query.orderBy(SORT_FIELD_MAP[params.sortField!], params.sortOrder),
        )
        .$if(Boolean(params?.limit), (query) => query.limit(params.limit!))
        .$if(Boolean(params?.offset), (query) => query.offset(params.offset!))
        .execute();
      return rows.map((row) => createAdminEntity(row));
    } catch (error) {
      throw RepositoryError.from(error);
    }
  },

  async findOne(id: string): Promise<AdminEntity | null> {
    try {
      const row = await db
        .selectFrom('admins')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst();
      return row ? createAdminEntity(row) : null;
    } catch (error) {
      throw RepositoryError.from(error);
    }
  },

  async findByEmail(email: string): Promise<AdminEntity | null> {
    try {
      const row = await db
        .selectFrom('admins')
        .selectAll()
        .where('email', '=', email)
        .executeTakeFirst();
      return row ? createAdminEntity(row) : null;
    } catch (error) {
      throw RepositoryError.from(error);
    }
  },

  async insert(entity: AdminEntity): Promise<string | null> {
    try {
      const result = await db
        .insertInto('admins')
        .values(createAdminTable(entity))
        .returning('id')
        .executeTakeFirst();
      return result?.id ?? null;
    } catch (error) {
      throw RepositoryError.from(error);
    }
  },

  async update(entity: Partial<AdminEntity> & { id: string }): Promise<string | null> {
    try {
      const updates = createAdminUpdates(entity);
      if (Object.keys(updates).length === 0) return entity.id;
      const result = await db
        .updateTable('admins')
        .set(updates)
        .where('id', '=', entity.id)
        .returning('id')
        .executeTakeFirst();
      return result?.id ?? null;
    } catch (error) {
      throw RepositoryError.from(error);
    }
  },

  async delete(id: string): Promise<string | null> {
    try {
      const result = await db
        .deleteFrom('admins')
        .where('id', '=', id)
        .returning('id')
        .executeTakeFirst();
      return result?.id ?? null;
    } catch (error) {
      throw RepositoryError.from(error);
    }
  },
} satisfies AdminRepository;
