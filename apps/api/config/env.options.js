const schema = {
  type: 'object',
  required: ['HTTP_PORT', 'POSTGRES_URL'],
  properties: {
    HTTP_PORT: {
      type: 'string',
      default: 5000
    },
    POSTGRES_URL: {
      type: 'string'
    }
  }
};

const envOptions = {
  confKey: 'config',
  schema: schema,
  dotenv: true, 
  data: process.env
};

module.exports = envOptions;