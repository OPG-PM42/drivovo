import type { ColumnType, Generated, Selectable, Insertable, Updateable } from 'kysely';
import type { UserEntity } from '@drivovo/domain';

type AvailabilityDay = 'today' | 'tomorrow' | 'weekend';
type AvailabilityTime = 'morning' | 'afternoon' | 'evening';
type DrivingExperience = 'beginner' | 'intermediate' | 'advanced';
type DrinksType = 'coffee' | 'tea';

export interface UsersTable {
  id: Generated<string>;
  name: string;
  email: string;
  phone: string | null;
  driving_experience: DrivingExperience | null;
  came_from: string | null;
  availability_day: AvailabilityDay | null;
  availability_time: AvailabilityTime | null;
  drinks: DrinksType | null;
  created_at: ColumnType<Date, Date | undefined, Date | undefined>;
  updated_at: ColumnType<Date, Date | undefined, Date | undefined>;
}

export function createUserEntity(row: Selectable<UsersTable>): UserEntity {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? '',
    drivingExperience: row.driving_experience ?? 'beginner',
    cameFrom: row.came_from ?? '',
    availability: {
      day: row.availability_day ?? 'today',
      time: row.availability_time ?? 'morning',
    },
    drinks: row.drinks ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createUserTable(entity: UserEntity): Insertable<UsersTable> {
  return {
    id: entity.id,
    name: entity.name,
    email: entity.email,
    phone: entity.phone || null,
    driving_experience: entity.drivingExperience || null,
    came_from: entity.cameFrom || null,
    availability_day: entity.availability?.day || null,
    availability_time: entity.availability?.time || null,
    drinks: entity.drinks || null,
  };
}

export function createUserUpdates(entity: Partial<UserEntity>): Updateable<UsersTable> {
  const props = {
    name: entity.name,
    email: entity.email,
    phone: entity.phone,
    driving_experience: entity.drivingExperience,
    came_from: entity.cameFrom,
    availability_day: entity.availability?.day,
    availability_time: entity.availability?.time,
    drinks: entity.drinks,
  };
  const result: Record<string, string | number | null> = {};
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) result[key] = value;
  }
  return result;
}
