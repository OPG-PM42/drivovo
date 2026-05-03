import type { ColumnType, Insertable, Selectable } from 'kysely';
import type { SessionEntity } from '@drivovo/domain';

export interface SessionsTable {
  token: string;
  data: ColumnType<unknown, string, string>;
  expires_at: ColumnType<Date, Date, Date>;
  created_at: ColumnType<Date, Date | undefined, Date | undefined>;
}

export function createSessionEntity(row: Selectable<SessionsTable>): SessionEntity {
  return {
    token: row.token,
    data: row.data,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  };
}

export function createSessionTable(
  entity: Omit<SessionEntity, 'createdAt'>,
): Insertable<SessionsTable> {
  return {
    token: entity.token,
    data: JSON.stringify(entity.data ?? {}),
    expires_at: entity.expiresAt,
  };
}
