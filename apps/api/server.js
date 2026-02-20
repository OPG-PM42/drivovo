const fastify = require('fastify')({
  logger: true
})
const fastifyEnv = require('@fastify/env');
const envOptions = require('./config/env.options');

const DatabaseManager = require('./infrostructure/db/DatabaseManager');
const dbManager = new DatabaseManager({
  postgres: { connectionString: fastify.config.POSTGRES_URL}
});

fastify.decorate('dbManager', dbManager);

fastify.register(require('./routes/app.routes'), {prefix: '/app'});
fastify.register(require('./routes/admin.routes'), {prefix: '/admin'});


const start = async () => {
  try {
    await fastify.register(fastifyEnv, envOptions);
    // Register other plugins or routes that depend on config here
    // fastify.register(require('./database-connector'), { url: ... });
    await fastify.listen({ port: fastify.config.HTTP_PORT });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

