'use strict';

const path = require('path');

const { pool, setClient } = require('./db');
const { readFile } = require('./utils');
const { insertCountry } = require('./country.seed');
const { insertTariff } = require('./tariff.seed');
const { insertCar } = require('./car.seed');
const { insertCarPrice } = require('./car-price.seed');
const { insertCarImages } = require('./car-image.seed');
const { insertCarPage } = require('./car-page.seed');
const { printSummary } = require('./summary');
const { COUNTRIES } = require('./data/country.data');
const { TARIFFS } = require('./data/tariff.data');

async function main() {
  console.log('=== DRIVOVO SEED: начало миграции ===');

  const data = readFile(path.join(__dirname, '..', 'data.json'));

  if (!Array.isArray(data) || data.length === 0) {
    console.error('data.json должен быть непустым массивом');
    process.exit(1);
  }

  console.log(`Загружено записей: ${data.length}`);

  const client = await pool.connect();
  setClient(client);

  try {
    await client.query('BEGIN');

    const country = await insertCountry(COUNTRIES[0]);
    const countryId = country?.id
      ?? (await client.query('SELECT id FROM countries WHERE iso2 = $1', [COUNTRIES[0].iso2])).rows[0].id;

    for (const t of TARIFFS) {
      await insertTariff(t);
    }

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      let car = await insertCar(row);

      if (!car) {
        const { rows } = await client.query('SELECT * FROM cars WHERE url = $1', [row.acf?.url]);
        car = rows[0];
        if (!car) continue;
      }

      const entry = { carId: car.id, acf: row.acf };

      await Promise.all([
        insertCarPrice({ countryId, ...entry }),
        insertCarImages(entry),
        insertCarPage(entry),
      ]);

      console.log(`  ✓ [${i + 1}/${data.length}] ${row.acf?.car_name || `Car #${i}`}`);
    }

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
