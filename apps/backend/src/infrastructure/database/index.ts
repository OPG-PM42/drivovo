import type { Generated } from 'kysely';
import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
import type { CarPagesTable, CarPageEntityView } from './tables/car-page';
import type { CarsTable } from './tables/car';
import type { CarPricesTable } from './tables/price';
import type { CountriesTable } from './tables/country';
import type { UsersTable } from './tables/user';
import type { CreditsTable } from './tables/credit';
import type { SubscriptionsTable } from './tables/tariff';

export * from './tables';

export interface OrdersTable {
  id: Generated<string>;
  tariff_id: string;
  car_id: string;
  country_id: string;
  name: string;
  price: number;
  currency: string;
}

export interface Database {
  car_pages: CarPagesTable;
  cars: CarsTable;
  car_prices: CarPricesTable;
  countries: CountriesTable;
  users: UsersTable;
  credits: CreditsTable;
  orders: OrdersTable;
  subscriptions: SubscriptionsTable;
  car_page_entity: CarPageEntityView;
}

pg.types.setTypeParser(1700, parseFloat);

const dialect = new PostgresDialect({
  pool: new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  }),
});

const db = new Kysely<Database>({ dialect });

export default db;
