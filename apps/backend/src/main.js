import { runServer } from '@drivovo/fastify';

import endpointMap from './endpoints/index.js';
import authProvider from './auth/index.js';

const port = Number(process.env['PORT'] ?? 3000);
const host = process.env['HOST'] ?? '0.0.0.0';

runServer({
  port,
  host,
  endpointMap,
  authProvider,
  config: { session: {} },
})
.then(() => {
  console.log(`Server listening on ${host}:${port}`);
})
.catch((err) => {
  console.error(err);
  process.exit(1);
});
