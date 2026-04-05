import type { ColumnType, Generated, Selectable, Insertable, Updateable } from 'kysely';
import type { CreditEntity, TariffEntity, CarEntity, CountryEntity, UserEntity } from '@drivovo/domain';

type CreditStatus = 'pending' | 'approved' | 'rejected';

export interface CreditsTable {
  id: Generated<string>;
  car_id: string;
  tariff_id: string;
  country_id: string;
  user_id: string;
  status: ColumnType<CreditStatus, CreditStatus | undefined, CreditStatus | undefined>;
  term: number | null;
  deposit_value: number | null;
  deposit_currency: string | null;
  created_at: ColumnType<Date, Date | undefined, Date | undefined>;
  updated_at: ColumnType<Date, Date | undefined, Date | undefined>;
}

export function createCreditEntity(
  row: Selectable<CreditsTable>,
  deps: { tariff: TariffEntity; car: CarEntity; country: CountryEntity; user: UserEntity },
): CreditEntity {
  return {
    id: row.id,
    tariff: deps.tariff,
    car: deps.car,
    country: deps.country,
    user: deps.user,
    status: row.status,
    term: row.term ?? 0,
    deposit: {
      value: row.deposit_value ?? 0,
      currency: row.deposit_currency ?? '',
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createCreditTable(entity: CreditEntity): Insertable<CreditsTable> {
  return {
    id: entity.id,
    car_id: entity.car.id,
    tariff_id: entity.tariff.id,
    country_id: entity.country.id,
    user_id: entity.user.id,
    status: entity.status,
    term: entity.term || null,
    deposit_value: entity.deposit.value || null,
    deposit_currency: entity.deposit.currency || null,
  };
}

export function createCreditUpdates(entity: Partial<CreditEntity>): Updateable<CreditsTable> {
  const props = {
    car_id: entity.car?.id,
    tariff_id: entity.tariff?.id,
    country_id: entity.country?.id,
    user_id: entity.user?.id,
    status: entity.status,
    term: entity.term,
    deposit_value: entity.deposit?.value,
    deposit_currency: entity.deposit?.currency,
  };
  const result: Record<string, string | number | null> = {};
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) result[key] = value;
  }
  return result;
}
