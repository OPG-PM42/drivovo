import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { hashPassword } from '@drivovo/utils';
import db from '../src/infrastructure/database';

const email = process.env['SEED_ADMIN_EMAIL'] ?? 'admin@drivovo.com';
const password = process.env['SEED_ADMIN_PASSWORD'] ?? 'Admin123!';

async function main() {
  const { hash, salt } = hashPassword(password);

  const result = await db
    .insertInto('admins')
    .values({
      id: randomUUID(),
      email,
      password_hash: hash,
      password_salt: salt,
      name: 'Admin',
      role: 'admin',
    })
    .onConflict((oc) => oc.column('email').doNothing())
    .returning('id')
    .executeTakeFirst();

  if (result?.id) {
    console.log(`Seeded admin: ${email}`);
  } else {
    console.log(`Admin already exists: ${email}`);
  }

  await db.destroy();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
