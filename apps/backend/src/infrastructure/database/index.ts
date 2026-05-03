import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
import type { UsersTable } from './tables/user';

export * from './tables';

export interface Database {
  users: UsersTable;
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
