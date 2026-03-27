import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env['DATABASE_URL'] ?? 'postgresql://oleg@localhost:5432/drivovo',
});
