import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config/env';
import databasePlugin from './plugins/database';
import healthRoutes from './routes/health';

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport:
      process.env.NODE_ENV !== 'production'
        ? {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
  },
});

async function start() {
  try {
    await fastify.register(cors, {
      origin: config.frontend.url,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    });

    // await fastify.register(databasePlugin);

    await fastify.register(healthRoutes, { prefix: '/api' });

    fastify.get('/', async (request, reply) => {
      return {
        message: 'Drivovo API',
        version: '1.0.0',
        endpoints: {
          health: '/api/health',
          healthDb: '/api/health/db',
          users: '/api/users',
        },
      };
    });

    await fastify.listen({
      port: config.api.port,
      host: config.api.host,
    });

    fastify.log.info(`Server running on http://${config.api.host}:${config.api.port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

const gracefulShutdown = async () => {
  fastify.log.info('Received shutdown signal, closing server...');
  await fastify.close();
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

start();
