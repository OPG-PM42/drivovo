import { FastifyPluginAsync } from 'fastify';

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  // Health check endpoint
  fastify.get('/health', async (request, reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  });

  // Database health check
  fastify.get('/health/db', async (request, reply) => {
    try {
      const client = await fastify.pg.connect();
      const { rows } = await client.query('SELECT NOW()');
      client.release();

      return {
        status: 'ok',
        database: 'connected',
        timestamp: rows[0].now,
      };
    } catch (err) {
      reply.code(503);
      return {
        status: 'error',
        database: 'disconnected',
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  });
};

export default healthRoutes;
