import Fastify from 'fastify';

import endpointMap from './endpoints/index.js';

// TODO: create nx lib (frameworks) and this function there
const runServer = async ({ port = 3000, host = '0.0.0.0', endpointMap = {} } = {}) => {
  const app = Fastify();
  const endpointEntries = Object.entries(endpointMap);

  for (const [namespace, endpoints] of endpointEntries) {
    for (const endpoint of endpoints) {
      app.route({
        method: endpoint.method,
        url: `/${namespace}${endpoint.path.startsWith('/') ? '' : '/'}${endpoint.path === '/' ? '' : endpoint.path}`,
        handler: async (request, reply) => {
          try {
            const response = await endpoint.handler(request.params, request.query);
            return reply.send(response);
          } catch (err) {
            const errInfo = err.code ? endpoint.errors?.[err.code] : null;
            if (errInfo) {
              return reply.status(errInfo.code).send({ code: errInfo.code, error: errInfo.message });
            }
            return reply.status(500).send({ error: 'Internal Server Error' });
          }
        },
      });
    }
  }

  try {
    await app.listen({ port, host });
    console.log(`Server is running on port ${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

runServer({
  port: Number(process.env['PORT'] ?? 3000),
  host: process.env['HOST'] ?? '0.0.0.0',
  endpointMap,
});