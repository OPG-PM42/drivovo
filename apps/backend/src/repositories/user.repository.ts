import type { UserEntity } from '@drivovo/domain';
import db from '../infrastructure/database';
import {
  createUserEntity,
  createUserTable,
  createUserUpdates,
} from '../infrastructure/database/tables';
import { type Repository, type SearchParams, RepositoryError } from './repository';

const SORT_FIELD_MAP = {
  name: 'name',
  email: 'email',
  phone: 'phone',
  driving_experience: 'driving_experience',
  came_from: 'came_from',
  created_at: 'created_at',
  updated_at: 'updated_at',
} as const;

type UserSearchParams = SearchParams<keyof typeof SORT_FIELD_MAP>;

export interface UserRepository extends Repository<UserEntity, UserSearchParams> {
  findByEmail(email: string): Promise<UserEntity | null>;
  findByPhone(phone: string): Promise<UserEntity | null>;
}

export default {
  async find(params: UserSearchParams = {}): Promise<UserEntity[]> {
    try {
      const rows = await db
        .selectFrom('users')
        .selectAll()
        .$if(Boolean(params?.sortField && SORT_FIELD_MAP[params.sortField!]), (query) =>
          query.orderBy(SORT_FIELD_MAP[params.sortField!], params.sortOrder),
        )
        .$if(Boolean(params?.limit), (query) => query.limit(params.limit!))
        .$if(Boolean(params?.offset), (query) => query.offset(params.offset!))
        .execute();
      return rows.map((row) => createUserEntity(row));
    } catch (error) {
      throw RepositoryError.from(error);
    }
  },

  async findOne(id: string): Promise<UserEntity | null> {
    try {
      const row = await db
        .selectFrom('users')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst();
      return row ? createUserEntity(row) : null;
    } catch (error) {
      throw RepositoryError.from(error);
    }
  },

  async findByEmail(email: string): Promise<UserEntity | null> {
    try {
      const row = await db
        .selectFrom('users')
        .selectAll()
        .where('email', '=', email)
        .executeTakeFirst();
      return row ? createUserEntity(row) : null;
    } catch (error) {
      throw RepositoryError.from(error);
    }
  },

  async findByPhone(phone: string): Promise<UserEntity | null> {
    try {
      const row = await db
        .selectFrom('users')
        .selectAll()
        .where('phone', '=', phone)
        .executeTakeFirst();
      return row ? createUserEntity(row) : null;
    } catch (error) {
      throw RepositoryError.from(error);
    }
  },

  async insert(entity: UserEntity): Promise<string | null> {
    try {
      const result = await db
        .insertInto('users')
        .values(createUserTable(entity))
        .returning('id')
        .executeTakeFirst();
      return result?.id ?? null;
    } catch (error) {
      throw RepositoryError.from(error);
    }
  },

  async update(entity: Partial<UserEntity> & { id: string }): Promise<string | null> {
    try {
      const updates = createUserUpdates(entity);
      if (Object.keys(updates).length === 0) return entity.id;
      const result = await db
        .updateTable('users')
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
        .deleteFrom('users')
        .where('id', '=', id)
        .returning('id')
        .executeTakeFirst();
      return result?.id ?? null;
    } catch (error) {
      throw RepositoryError.from(error);
    }
  },
} satisfies UserRepository;
