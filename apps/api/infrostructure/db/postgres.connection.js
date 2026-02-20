const { Pool } = require('pg');

module.exports = async (config) => {
  return new Pool(config);
}
