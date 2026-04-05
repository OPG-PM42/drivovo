import type { ColumnType, Generated, Selectable, Insertable } from 'kysely';
import type { Price } from '@drivovo/domain';

export interface CarPricesTable {
  id: Generated<string>;
  car_id: string;
  country_id: string;
  value: ColumnType<number, number, number>;
  currency: string;
}

export function createPrice(row: Selectable<CarPricesTable>): Price {
  return {
    value: row.value,
    currency: row.currency,
    countryId: row.country_id,
    carId: row.car_id,
  };
}

export function createPriceTable(price: Price): Insertable<CarPricesTable> {
  return {
    car_id: price.carId,
    country_id: price.countryId,
    value: price.value,
    currency: price.currency,
  };
}
