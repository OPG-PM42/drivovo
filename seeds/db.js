'use strict';

const { Pool } = require('pg');

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://drivovo:drivovo_dev@localhost:5432/drivovo',
});

module.exports = { pool };
