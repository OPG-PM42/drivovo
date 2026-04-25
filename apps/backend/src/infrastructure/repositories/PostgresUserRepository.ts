import type { UserEntity, UserSearchParams, UserRepository } from '@drivovo/domain';
import type { Pool } from '../pg/mock-pg';
import { PostgresRepository, type FieldMap } from './base.repository';

type SystemFields = 'id' | 'createdAt' | 'updatedAt';
type UserFields = Omit<UserEntity, SystemFields>;

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

const USER_COLUMNS: string[] = [
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

const SEARCH_FIELD_MAP: FieldMap<UserSearchParams> = {
  drivingExperience: 'driving_experience',
  cameFrom: 'came_from',
  availabilityDay: 'availability_day',
  availabilityTime: 'availability_time',
};

/**
 * Maps flat (non-nested, non-transformed) entity fields to DB columns.
 * The nested `availability` object is split across two columns and is
 * mapped via `AVAILABILITY_FIELD_MAP`.
 */
const FLAT_FIELD_MAP: FieldMap<UserFields> = {
  name: 'name',
  email: 'email',
  phone: 'phone',
  drivingExperience: 'driving_experience',
  cameFrom: 'came_from',
  drinks: 'drinks',
};

const AVAILABILITY_FIELD_MAP: FieldMap<UserEntity['availability']> = {
  day: 'availability_day',
  time: 'availability_time',
};

export class PostgresUserRepository
  extends PostgresRepository<UserEntity, UserRow, UserSearchParams>
  implements UserRepository
{
  protected readonly table: string = 'users';
  protected readonly columns: string[] = USER_COLUMNS;
  protected readonly sortFieldMap: Record<string, string> = SORT_FIELD_MAP;
  protected readonly defaultSortColumn: string = 'created_at';
  protected override readonly searchFieldMap: FieldMap<UserSearchParams> =
    SEARCH_FIELD_MAP;
  protected override readonly hasTimestamps: boolean = true;

  constructor(pool: Pool) {
    super(pool);
  }

  public async findByEmail(email: string): Promise<UserEntity | null> {
    return this.findBy('email', email);
  }

  public async findByPhone(phone: string): Promise<UserEntity | null> {
    return this.findBy('phone', phone);
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

  protected entityToRow(data: UserFields): Record<string, unknown> {
    return {
      ...this.mapDefinedFields(data, FLAT_FIELD_MAP),
      ...this.mapDefinedFields(data.availability, AVAILABILITY_FIELD_MAP),
      drinks: data.drinks ?? null,
    };
  }

  protected partialEntityToRow(
    data: Partial<UserFields>,
  ): Record<string, unknown> {
    const row = this.mapDefinedFields(data, FLAT_FIELD_MAP);
    if (data.availability !== undefined) {
      Object.assign(
        row,
        this.mapDefinedFields(data.availability, AVAILABILITY_FIELD_MAP),
      );
    }
    return row;
  }
}
