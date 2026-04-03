import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';

const dialect = new PostgresDialect({
  pool: new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  }),
});

export const db = new Kysely({ dialect });
