import type {
  UserEntity,
  UserRepository,
  UserSearchParams,
} from '@drivovo/domain';
import db from '../database';
import {
  createUserEntity,
  createUserTable,
  createUserUpdates,
} from '../database/tables/user';

const SORT_FIELD_MAP = {
  name: 'name',
  email: 'email',
  phone: 'phone',
  drivingExperience: 'driving_experience',
  cameFrom: 'came_from',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
} as const;

type SortField = Extract<keyof typeof SORT_FIELD_MAP, string>;

const isSortField = (value: string | undefined): value is SortField =>
  value !== undefined && Object.hasOwn(SORT_FIELD_MAP, value);

const toKyselyOrder = (
  order: UserSearchParams['sortOrder'],
): 'asc' | 'desc' => (order === 'ASC' ? 'asc' : 'desc');

export default {
  async find(params: UserSearchParams): Promise<UserEntity[]> {
    const sortColumn = isSortField(params.sortField)
      ? SORT_FIELD_MAP[params.sortField]
      : 'created_at';

    const rows = await db
      .selectFrom('users')
      .selectAll()
      .$if(params.drivingExperience !== undefined, (q) =>
        q.where('driving_experience', '=', params.drivingExperience!),
      )
      .$if(params.cameFrom !== undefined, (q) =>
        q.where('came_from', '=', params.cameFrom!),
      )
      .$if(params.availabilityDay !== undefined, (q) =>
        q.where('availability_day', '=', params.availabilityDay!),
      )
      .$if(params.availabilityTime !== undefined, (q) =>
        q.where('availability_time', '=', params.availabilityTime!),
      )
      .orderBy(sortColumn, toKyselyOrder(params.sortOrder))
      .$if(params.limit !== undefined, (q) => q.limit(params.limit!))
      .$if(params.offset !== undefined, (q) => q.offset(params.offset!))
      .execute();

    return rows.map(createUserEntity);
  },

  async findOne(id: string): Promise<UserEntity | null> {
    const row = await db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return row ? createUserEntity(row) : null;
  },

  async findByEmail(email: string): Promise<UserEntity | null> {
    const row = await db
      .selectFrom('users')
      .selectAll()
      .where('email', '=', email)
      .executeTakeFirst();

    return row ? createUserEntity(row) : null;
  },

  async findByPhone(phone: string): Promise<UserEntity | null> {
    const row = await db
      .selectFrom('users')
      .selectAll()
      .where('phone', '=', phone)
      .executeTakeFirst();

    return row ? createUserEntity(row) : null;
  },

  async insert(
    data: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<string> {
    const result = await db
      .insertInto('users')
      .values(createUserTable(data))
      .returning('id')
      .executeTakeFirstOrThrow();

    return result.id;
  },

  async update(
    id: string,
    data: Partial<Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<void> {
    const updates = createUserUpdates(data);
    if (Object.keys(updates).length === 0) return;

    await db
      .updateTable('users')
      .set({ ...updates, updated_at: new Date() })
      .where('id', '=', id)
      .execute();
  },

  async delete(id: string): Promise<void> {
    await db.deleteFrom('users').where('id', '=', id).execute();
  },
} satisfies UserRepository;
