'use strict';

const fs = require('fs');
const path = require('path');

const { pool } = require('./db');
const { seedCountry } = require('./country.seed');
const { seedTariffs } = require('./tariff.seed');
const { seedCars } = require('./car.seed');
const { seedCarPrices } = require('./car-price.seed');
const { seedCarImages } = require('./car-image.seed');
const { seedCarPages } = require('./car-page.seed');
const { printSummary } = require('./summary');

async function main() {
  console.log('=== DRIVOVO SEED: начало миграции ===');

  const dataPath = path.join(__dirname, '..', 'data.json');
  if (!fs.existsSync(dataPath)) {
    console.error('Файл data.json не найден:', dataPath);
    process.exit(1);
  }

  const raw  = fs.readFileSync(dataPath, 'utf-8');
  const data = JSON.parse(raw);

  if (!Array.isArray(data) || data.length === 0) {
    console.error('data.json должен быть непустым массивом');
    process.exit(1);
  }

  console.log(`Загружено записей: ${data.length}`);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const countryId  = await seedCountry(client);
    await seedTariffs(client);
    const carEntries = await seedCars(client, data);
    await seedCarPrices(client, carEntries, countryId);
    await seedCarImages(client, carEntries);
    await seedCarPages(client, carEntries);

    await client.query('COMMIT');
    console.log('\n✅ Транзакция успешно зафиксирована.');

    await printSummary(client);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌ Ошибка — ROLLBACK выполнен:', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }

  console.log('\n=== SEED завершён ===');
}

main();
