import pg from 'pg';

const { Pool } = pg;

let pool;

export const createPool = (connectionString) => {
  pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });

  pool.on('error', (err) => {
    console.error('Непредвиденная ошибка пула:', err.message);
  });

  return pool;
};

export const getPool = () => {
  if (!pool) throw new Error('Пул базы данных не инициализирован. Сначала вызовите createPool().');
  return pool;
};

export const closePool = async () => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};
