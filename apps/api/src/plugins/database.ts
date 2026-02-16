import { FastifyPluginAsync } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import fastifyPostgres from '@fastify/postgres';
import { config } from '../config/env';

const databasePlugin: FastifyPluginAsync = async (fastify) => {
  fastify.register(fastifyPostgres, {
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database,
  });

  fastify.log.info('PostgreSQL connection established');

  fastify.addHook('onReady', async () => {
    try {
      const client = await fastify.pg.connect();
      const { rows } = await client.query('SELECT NOW()');
      fastify.log.info(`Database connected at: ${rows[0].now}`);
      client.release();
    } catch (err) {
      fastify.log.error(err, 'Database connection error:');
    }
  });
};

export default fastifyPlugin(databasePlugin);
