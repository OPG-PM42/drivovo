import type {
  ColumnType,
  Generated,
  Insertable,
  Selectable,
  Updateable,
} from 'kysely';
import type { UserEntity } from '@drivovo/domain';

type AvailabilityDay = UserEntity['availability']['day'];
type AvailabilityTime = UserEntity['availability']['time'];
type DrivingExperience = UserEntity['drivingExperience'];
type Drinks = NonNullable<UserEntity['drinks']>;

export interface UsersTable {
  id: Generated<string>;
  name: string;
  email: string;
  phone: string;
  driving_experience: DrivingExperience;
  came_from: string;
  availability_day: AvailabilityDay;
  availability_time: AvailabilityTime;
  drinks: Drinks | null;
  created_at: ColumnType<Date, Date | undefined, Date | undefined>;
  updated_at: ColumnType<Date, Date | undefined, Date | undefined>;
}

export const createUserEntity = (row: Selectable<UsersTable>): UserEntity => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone,
  drivingExperience: row.driving_experience,
  cameFrom: row.came_from,
  availability: {
    day: row.availability_day,
    time: row.availability_time,
  },
  drinks: row.drinks ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

type UserPayload = Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>;

export const createUserTable = (
  data: UserPayload,
): Insertable<UsersTable> => ({
  name: data.name,
  email: data.email,
  phone: data.phone,
  driving_experience: data.drivingExperience,
  came_from: data.cameFrom,
  availability_day: data.availability.day,
  availability_time: data.availability.time,
  drinks: data.drinks ?? null,
});

export const createUserUpdates = (
  data: Partial<UserPayload>,
): Updateable<UsersTable> => {
  const props: Updateable<UsersTable> = {
    name: data.name,
    email: data.email,
    phone: data.phone,
    driving_experience: data.drivingExperience,
    came_from: data.cameFrom,
    availability_day: data.availability?.day,
    availability_time: data.availability?.time,
  };
  if (data.drinks !== undefined) props.drinks = data.drinks ?? null;

  const result: Updateable<UsersTable> = {};
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) {
      (result as Record<string, unknown>)[key] = value;
    }
  }
  return result;
};
