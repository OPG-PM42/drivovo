class DatabaseManager {
  constructor(config) {
    this.config = config;
    this.connections = {};
  }

  async get(type) {
    if (this.connections[type]) {
      return this.connections[type];
    }

    switch (type) {
      case 'postgres': {
        const create = require('./postgres.connection');
        this.connections.postgres = await create(this.config.postgres);
        return this.connections.postgres;
      }

    //   case 'redis': {
    //     const create = require('./redis.client')
    //     this.connections.redis = await create(this.config.redis)
    //     return this.connections.redis
    //   }

      default:
        throw new Error('Unknown DB type');
    }
  }
}

module.exports = DatabaseManager;