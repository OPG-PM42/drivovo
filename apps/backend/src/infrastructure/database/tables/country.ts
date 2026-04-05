import type { Generated, Selectable, Insertable, Updateable } from 'kysely';
import type { CountryEntity } from '@drivovo/domain';

export interface CountriesTable {
  id: Generated<string>;
  name: string;
  iso2: string;
  iso3: string;
  phone_code: string | null;
  currency: string;
}

export function createCountryEntity(row: Selectable<CountriesTable>): CountryEntity {
  return {
    id: row.id,
    name: row.name,
    iso2: row.iso2,
    iso3: row.iso3,
    phoneCode: row.phone_code ?? '',
    currency: row.currency,
  };
}

export function createCountryTable(entity: CountryEntity): Insertable<CountriesTable> {
  return {
    id: entity.id,
    name: entity.name,
    iso2: entity.iso2,
    iso3: entity.iso3,
    phone_code: entity.phoneCode || null,
    currency: entity.currency,
  };
}

export function createCountryUpdates(entity: Partial<CountryEntity>): Updateable<CountriesTable> {
  const props = {
    name: entity.name,
    iso2: entity.iso2,
    iso3: entity.iso3,
    phone_code: entity.phoneCode,
    currency: entity.currency,
  };
  const result: Record<string, string | number | null> = {};
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) result[key] = value;
  }
  return result;
}
