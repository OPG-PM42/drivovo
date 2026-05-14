import type { Generated, JSONColumnType, Selectable, Insertable, Updateable } from 'kysely';
import type { TariffEntity } from '@drivovo/domain';

type TariffType = 'leasing' | 'subscription';

type OptionJson = {
  name: string;
  price: { value: number; currency: string };
  carId: string | null;
  countryId: string | null;
};

export interface SubscriptionsTable {
  id: Generated<string>;
  type: TariffType;
  name: string;
  options: JSONColumnType<OptionJson[], OptionJson[], OptionJson[]>;
}

export function createTariffEntity(row: Selectable<SubscriptionsTable>): TariffEntity {
  const rawOptions = row.options;
  const options = Array.isArray(rawOptions)
    ? rawOptions
    : typeof rawOptions === 'string'
      ? JSON.parse(rawOptions)
      : [];
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    options: options.map((o: OptionJson) => ({
      name: o.name,
      price: { value: o.price.value, currency: o.price.currency },
      carId: o.carId ?? undefined,
      countryId: o.countryId ?? undefined,
    })),
  };
}

export function createTariffTable(entity: TariffEntity): Insertable<SubscriptionsTable> {
  return {
    id: entity.id,
    type: entity.type,
    name: entity.name,
    options: entity.options.map((o) => ({
      name: o.name,
      price: { value: o.price.value, currency: o.price.currency },
      carId: o.carId ?? null,
      countryId: o.countryId ?? null,
    })) as unknown as OptionJson[],
  };
}

export function createTariffUpdates(entity: Partial<TariffEntity>): Updateable<SubscriptionsTable> {
  const result: Record<string, string | number | null | object> = {};
  if (entity.type !== undefined) result['type'] = entity.type;
  if (entity.name !== undefined) result['name'] = entity.name;
  if (entity.options !== undefined) {
    result['options'] = entity.options.map((o) => ({
      name: o.name,
      price: { value: o.price.value, currency: o.price.currency },
      carId: o.carId ?? null,
      countryId: o.countryId ?? null,
    }));
  }
  return result;
}
