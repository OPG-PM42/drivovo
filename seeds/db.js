'use strict';

const { Pool } = require('pg');

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://drivovo:drivovo_dev@localhost:5432/drivovo',
});

let _client = null;

const setClient = (client) => { _client = client; };
const getClient = () => _client;

module.exports = { pool, setClient, getClient };
