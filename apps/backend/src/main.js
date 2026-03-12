import Fastify from 'fastify';

import { createPool, closePool } from './infra/db.js';
import endpointMap from './endpoints/index.js';

const runServer = async ({ port = 5000, host = '0.0.0.0', endpointMap = {}, databaseUrl } = {}) => {
  const db = createPool(databaseUrl);

  const app = Fastify();

  // Health check
  app.get('/health', async () => ({ status: 'ok' }));

  const endpointEntries = Object.entries(endpointMap);

  for (const [namespace, endpoints] of endpointEntries) {
    for (const endpoint of endpoints) {
      app.route({
        method: endpoint.method,
        url: `/${namespace}${endpoint.path.startsWith('/') ? '' : '/'}${endpoint.path === '/' ? '' : endpoint.path}`,
        handler: async (request, reply) => {
          try {
            const response = await endpoint.handler(request.params);
            return reply.send(response);
          } catch (err) {
            const errInfo = err.code ? endpoint.errors?.[err.code] : null;
            if (errInfo) {
              return reply.status(errInfo.code).send({ code: err.code, error: errInfo.message });
            }
            return reply.status(500).send({ error: 'Internal Server Error' });
          }
        },
      });
    }
  }

  const shutdown = async (signal) => {
    console.log(`\n${signal} Непредвиденная ошибка, завершаем работу...`);
    await app.close();
    await closePool();
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  try {
    await app.listen({ port, host });
    console.log(`Server is running on port ${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

runServer({
  port: Number(process.env['PORT'] ?? 5000),
  host: process.env['HOST'] ?? '0.0.0.0',
  endpointMap,
  databaseUrl: process.env['DATABASE_URL'] ?? 'postgresql://drivovo:drivovo_dev@localhost:5432/drivovo',
});
