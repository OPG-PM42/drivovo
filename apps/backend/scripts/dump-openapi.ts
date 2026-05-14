import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildApp } from '@drivovo/fastify';
import endpointMap from '../src/endpoints/index';

const noopAuthProvider = {
  async restoreSession(_token: string) {
    return null;
  },
  async startSession(_token: string, _data?: unknown) {
    return { token: '', expiresAt: new Date() };
  },
  async endSession(_token: string) {},
};

async function main() {
  const app = await buildApp({
    endpointMap,
    authProvider: noopAuthProvider,
  });

  await app.ready();
  const spec = app.swagger();
  const outPath = resolve(process.cwd(), 'apps/backend/openapi.json');
  writeFileSync(outPath, JSON.stringify(spec, null, 2));
  console.log(`OpenAPI spec written to ${outPath}`);
  await app.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
