import type { Generated, Selectable, Insertable, Updateable } from 'kysely';
import type { TariffEntity } from '@drivovo/domain';

type TariffType = 'leasing' | 'subscription';

export interface SubscriptionsTable {
  id: Generated<string>;
  type: TariffType;
  name: string;
}

export function createTariffEntity(row: Selectable<SubscriptionsTable>): TariffEntity {
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    options: [],
  };
}

export function createTariffTable(entity: TariffEntity): Insertable<SubscriptionsTable> {
  return {
    id: entity.id,
    type: entity.type,
    name: entity.name,
  };
}

export function createTariffUpdates(entity: Partial<TariffEntity>): Updateable<SubscriptionsTable> {
  const props = {
    type: entity.type,
    name: entity.name,
  };
  const result: Record<string, string | number | null> = {};
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) result[key] = value;
  }
  return result;
}
