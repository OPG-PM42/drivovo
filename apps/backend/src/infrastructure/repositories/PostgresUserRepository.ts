import type { UserEntity, UserSearchParams, UserRepository } from '@drivovo/domain';
import type { PgSelectBuilder } from '@metarhia/sql';
import type { Pool } from '../pg/mock-pg';
import { PostgresRepository } from './base.repository';

type SystemFields = 'id' | 'createdAt' | 'updatedAt';

interface UserRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  driving_experience: UserEntity['drivingExperience'];
  came_from: string;
  availability_day: string;
  availability_time: string;
  drinks: string | null;
  created_at: string;
  updated_at: string;
}

const USER_COLUMNS = [
  'id',
  'name',
  'email',
  'phone',
  'driving_experience',
  'came_from',
  'availability_day',
  'availability_time',
  'drinks',
  'created_at',
  'updated_at',
];

const SORT_FIELD_MAP: Record<string, string> = {
  name: 'name',
  email: 'email',
  phone: 'phone',
  drivingExperience: 'driving_experience',
  cameFrom: 'came_from',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

export class PostgresUserRepository
  extends PostgresRepository<UserEntity, UserRow, UserSearchParams>
  implements UserRepository
{
  protected readonly table = 'users';
  protected readonly columns = USER_COLUMNS;
  protected readonly sortFieldMap = SORT_FIELD_MAP;
  protected readonly defaultSortColumn = 'created_at';
  protected override readonly hasTimestamps = true;

  constructor(pool: Pool) {
    super(pool);
  }

  protected rowToEntity(row: UserRow): UserEntity {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      drivingExperience: row.driving_experience,
      cameFrom: row.came_from,
      availability: {
        day: row.availability_day as UserEntity['availability']['day'],
        time: row.availability_time as UserEntity['availability']['time'],
      },
      drinks: row.drinks as UserEntity['drinks'],
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  protected entityToRow(
    data: Omit<UserEntity, SystemFields>,
  ): Record<string, unknown> {
    return {
      name: data.name,
      email: data.email,
      phone: data.phone,
      driving_experience: data.drivingExperience,
      came_from: data.cameFrom,
      availability_day: data.availability.day,
      availability_time: data.availability.time,
      drinks: data.drinks ?? null,
    };
  }

  protected partialEntityToRow(
    data: Partial<Omit<UserEntity, SystemFields>>,
  ): Record<string, unknown> {
    const row: Record<string, unknown> = {};
    if (data.name !== undefined) row['name'] = data.name;
    if (data.email !== undefined) row['email'] = data.email;
    if (data.phone !== undefined) row['phone'] = data.phone;
    if (data.drivingExperience !== undefined)
      row['driving_experience'] = data.drivingExperience;
    if (data.cameFrom !== undefined) row['came_from'] = data.cameFrom;
    if (data.availability !== undefined) {
      row['availability_day'] = data.availability.day;
      row['availability_time'] = data.availability.time;
    }
    if (data.drinks !== undefined) row['drinks'] = data.drinks;
    return row;
  }

  protected applySearchFilters(
    query: PgSelectBuilder,
    params: UserSearchParams,
  ): void {
    if (params.drivingExperience !== undefined) {
      query.whereEq('driving_experience', params.drivingExperience);
    }
    if (params.cameFrom !== undefined) {
      query.whereEq('came_from', params.cameFrom);
    }
    if (params.availabilityDay !== undefined) {
      query.whereEq('availability_day', params.availabilityDay);
    }
    if (params.availabilityTime !== undefined) {
      query.whereEq('availability_time', params.availabilityTime);
    }
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.findBy('email', email);
  }

  async findByPhone(phone: string): Promise<UserEntity | null> {
    return this.findBy('phone', phone);
  }
}
