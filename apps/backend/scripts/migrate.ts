import 'dotenv/config';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import migrator from '../src/infrastructure/database/migrator';
import db from '../src/infrastructure/database';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, '../src/infrastructure/database/migrations');

async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'latest': {
      const { error, results } = await migrator.migrateToLatest();
      results?.forEach((r) => {
        if (r.status === 'Success') {
          console.log(`  ✓ ${r.migrationName}`);
        } else if (r.status === 'Error') {
          console.error(`  ✗ ${r.migrationName}`);
        }
      });
      if (error) {
        console.error('Migration failed:', error);
        process.exit(1);
      }
      if (!results?.length) {
        console.log('No pending migrations.');
      } else {
        console.log('Migrations applied successfully.');
      }
      break;
    }

    case 'up': {
      const { error, results } = await migrator.migrateUp();
      results?.forEach((r) => {
        if (r.status === 'Success') {
          console.log(`  ✓ ${r.migrationName}`);
        } else if (r.status === 'Error') {
          console.error(`  ✗ ${r.migrationName}`);
        }
      });
      if (error) {
        console.error('Migration failed:', error);
        process.exit(1);
      }
      if (!results?.length) {
        console.log('No pending migrations.');
      }
      break;
    }

    case 'down': {
      const { error, results } = await migrator.migrateDown();
      results?.forEach((r) => {
        if (r.status === 'Success') {
          console.log(`  ✓ rolled back ${r.migrationName}`);
        } else if (r.status === 'Error') {
          console.error(`  ✗ ${r.migrationName}`);
        }
      });
      if (error) {
        console.error('Rollback failed:', error);
        process.exit(1);
      }
      if (!results?.length) {
        console.log('No migrations to roll back.');
      }
      break;
    }

    case 'status': {
      const migrations = await migrator.getMigrations();
      console.log('Migrations:');
      for (const m of migrations) {
        const status = m.executedAt ? `executed at ${m.executedAt.toISOString()}` : 'pending';
        console.log(`  ${m.name} — ${status}`);
      }
      break;
    }

    case 'create': {
      const name = process.argv[3];
      if (!name) {
        console.error('Usage: migrate create <name>');
        process.exit(1);
      }
      const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
      const fileName = `${timestamp}_${name}.ts`;
      const filePath = path.join(MIGRATIONS_DIR, fileName);
      const template = `import type { Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  // TODO: implement migration
}

export async function down(db: Kysely<unknown>): Promise<void> {
  // TODO: implement rollback
}
`;
      await fs.writeFile(filePath, template);
      console.log(`Created: ${fileName}`);
      break;
    }

    default:
      console.error('Usage: migrate <latest|up|down|status|create> [name]');
      process.exit(1);
  }

  await db.destroy();
}

main();
