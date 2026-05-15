import type { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely';
import type { AdminEntity, AdminRole } from '@drivovo/domain';

export interface AdminsTable {
  id: Generated<string>;
  email: string;
  password_hash: string;
  password_salt: string;
  name: string;
  role: AdminRole;
  created_at: ColumnType<Date, Date | undefined, Date | undefined>;
  updated_at: ColumnType<Date, Date | undefined, Date | undefined>;
}

export function createAdminEntity(row: Selectable<AdminsTable>): AdminEntity {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    passwordHash: row.password_hash,
    passwordSalt: row.password_salt,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createAdminTable(entity: AdminEntity): Insertable<AdminsTable> {
  return {
    email: entity.email,
    name: entity.name,
    role: entity.role,
    password_hash: entity.passwordHash,
    password_salt: entity.passwordSalt,
  };
}

export function createAdminUpdates(
  entity: Partial<AdminEntity>,
): Updateable<AdminsTable> {
  const props = {
    email: entity.email,
    name: entity.name,
    role: entity.role,
    password_hash: entity.passwordHash,
    password_salt: entity.passwordSalt,
  };
  const result: Record<string, string | number | null> = {};
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) result[key] = value;
  }
  return result;
}
