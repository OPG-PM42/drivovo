import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`CREATE TYPE admin_role AS ENUM ('admin', 'manager')`.execute(db);

  await sql`
    CREATE TABLE admins (
      id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
      email varchar(255) NOT NULL,
      password_hash text NOT NULL,
      password_salt text NOT NULL,
      name varchar(255) NOT NULL,
      role admin_role NOT NULL,
      created_at timestamp DEFAULT now() NOT NULL,
      updated_at timestamp DEFAULT now() NOT NULL
    )
  `.execute(db);

  await sql`
    CREATE TABLE sessions (
      token text NOT NULL PRIMARY KEY,
      data jsonb DEFAULT '{}' NOT NULL,
      expires_at timestamp NOT NULL,
      created_at timestamp DEFAULT now() NOT NULL
    )
  `.execute(db);

  await sql`CREATE UNIQUE INDEX idx_admins_email ON admins USING btree (email)`.execute(db);
  await sql`CREATE INDEX idx_sessions_expires_at ON sessions USING btree (expires_at)`.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`DROP TABLE IF EXISTS sessions CASCADE`.execute(db);
  await sql`DROP TABLE IF EXISTS admins CASCADE`.execute(db);
  await sql`DROP TYPE IF EXISTS admin_role`.execute(db);
}
