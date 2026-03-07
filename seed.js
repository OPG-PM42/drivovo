'use strict';

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://drivovo:drivovo_dev@localhost:5432/drivovo',
});


const ENGINE_TYPE_MAP = {
  'gasoline: Бензин': 'petrol',
  'diesel: Дизель':   'diesel',
  'gybrid: Гибрид':   'hybrid',
  'electric: Електро': 'electric',
};

const DRIVE_TYPE_MAP = {
  'full: Повний':     'AWD',
  'front: Передній':  'FWD',
  'rear: Задній':     'RWD',
};

const BODY_TYPE_MAP = {
  suv:       'suv',
  sedan:     'sedan',
  hatchback: 'hatchback',
  coupe:     'coupe',
  van:       'van',
  mpv:       'mpv',
  pickup:    'pickup',
  bus:       'bus',
};

const STATUS_MAP = {
  'aval: Доступно':            'available',
  'request: Під замовлення':   'order',
};

const INTERIOR_MAP = {
  'combine: Комбінований': 'Combined',
  'shkira: Шкіра':         'Leather',
  'textile: Текстиль':     'Textile',
};

function stripHtml(html) {
  if (!html) return null;
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, '')
    .replace(/\s+/g, ' ')
    .trim() || null;
}

function mapOrWarn(map, value, fieldName, carName) {
  if (!value) return null;
  const mapped = map[value];
  if (!mapped) {
    console.warn(`  ⚠  [${carName}] Неизвестное значение ${fieldName}: "${value}" → null`);
    return null;
  }
  return mapped;
}

function collectImages(acf) {
  const fields = ['preview_photo', 'crop_1', 'crop_2', 'crop_3', 'crop_4', 'adphoto_1', 'adphoto_2', 'adphoto_3'];
  return fields
    .map(f => acf[f])
    .filter(url => url && typeof url === 'string' && url.startsWith('http'));
}

async function seedCountry(client) {
  console.log('\n[1/6] Countries...');
  const result = await client.query(`
    INSERT INTO countries (name, iso2, iso3, phone_code, currency)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (iso2) DO NOTHING
    RETURNING id
  `, ['Ukraine', 'UA', 'UKR', '+380', 'EUR']);

  if (result.rows.length > 0) {
    console.log('  ✓ Ukraine вставлена, id:', result.rows[0].id);
  } else {
    console.log('  ℹ Ukraine уже существует (пропущена)');
  }

  const { rows } = await client.query(`SELECT id FROM countries WHERE iso2 = 'UA'`);
  return rows[0].id;
}

async function seedTariffs(client) {
  console.log('\n[2/6] Tariffs...');
  const tariffs = [
    { type: 'leasing',      name: 'Leasing' },
    { type: 'subscription', name: 'Subscription' },
  ];

  const ids = {};
  for (const t of tariffs) {
    await client.query(`
      INSERT INTO tariffs (type, name) VALUES ($1, $2)
      ON CONFLICT DO NOTHING
    `, [t.type, t.name]);

    const { rows } = await client.query(`SELECT id FROM tariffs WHERE type = $1`, [t.type]);
    ids[t.type] = rows[0].id;
    console.log(`  ✓ ${t.name} (${t.type}), id: ${rows[0].id}`);
  }
  return ids;
}

async function seedCars(client, data, countryId) {
  console.log('\n[3/6] Cars, images, car_prices...');
  const carIds = []; // [{ carId, acf }]

  for (let i = 0; i < data.length; i++) {
    const acf = data[i].acf;
    const carName = acf.car_name || `Car #${i}`;

    const engineType   = mapOrWarn(ENGINE_TYPE_MAP, acf.engine_type, 'engine_type', carName) || 'other';
    const driveType    = mapOrWarn(DRIVE_TYPE_MAP,  acf.drive_type,  'drive_type',  carName) || 'AWD';
    const bodyType     = mapOrWarn(BODY_TYPE_MAP,   acf.body_type,   'body_type',   carName) || 'other';
    const status       = mapOrWarn(STATUS_MAP,      acf.label_status,'label_status',carName) || 'available';
    const interiorTrim = mapOrWarn(INTERIOR_MAP, acf.vehicle_interior, 'vehicle_interior', carName);

    const carResult = await client.query(`
      INSERT INTO cars
        (name, brand, description, drive_type, type, url, acceleration, power,
         color, interior_trim, status, engine_type, engine_capacity, engine_fuel_cons)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      ON CONFLICT DO NOTHING
      RETURNING id
    `, [
      acf.car_name        || null,
      acf.car_brand       || null,
      acf.text            || null,
      driveType,
      bodyType,
      acf.url             || null,
      acf.acceleration    || null,
      acf.power           || null,
      acf.exterior_color  || null,
      interiorTrim,
      status,
      engineType,
      acf.engine_capacity || null,
      acf.fuel_consumption ? String(acf.fuel_consumption) : null,
    ]);

    let carId;
    if (carResult.rows.length > 0) {
      carId = carResult.rows[0].id;
      console.log(`  ✓ [${i + 1}/${data.length}] ${carName} → car.id: ${carId}`);
    } else {
      const existing = await client.query(`SELECT id FROM cars WHERE url = $1`, [acf.url]);
      if (existing.rows.length === 0) {
        console.warn(`  ⚠  ${carName}: не вставлена и не найдена по url="${acf.url}" — пропущена`);
        continue;
      }
      carId = existing.rows[0].id;
      console.log(`  ℹ [${i + 1}/${data.length}] ${carName} уже существует, id: ${carId}`);
    }

    const priceRaw = acf.calculator_props?.car_price_ex_showroom;
    const price    = priceRaw ? parseFloat(priceRaw) : null;

    if (price && !isNaN(price)) {
      await client.query(`
        INSERT INTO car_prices (car_id, country_id, value, currency)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (car_id, country_id) DO NOTHING
      `, [carId, countryId, price, 'EUR']);
    } else {
      console.warn(`  ⚠  ${carName}: цена отсутствует или не число ("${priceRaw}")`);
    }

    const imageUrls = collectImages(acf);
    for (const url of imageUrls) {
      await client.query(`
        INSERT INTO images (parent_id, parent_type, url, alt)
        VALUES ($1, 'car', $2, $3)
        ON CONFLICT DO NOTHING
      `, [carId, url, acf.car_name || null]);
    }
    if (imageUrls.length > 0) {
      console.log(`     ↳ ${imageUrls.length} изображений`);
    }

    carIds.push({ carId, acf });
  }

  return carIds;
}

async function seedCarPages(client, carEntries) {
  console.log('\n[4/6] Car pages...');
  const pageIds = []; // [{ pageId, acf }]

  for (const { carId, acf } of carEntries) {
    const description = [acf.prm_1, acf.prm_2, acf.prm_3]
      .filter(Boolean)
      .join('\n');

    const result = await client.query(`
      INSERT INTO car_pages (car_id, title, description, seo_title, seo_description)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (car_id) DO NOTHING
      RETURNING id
    `, [
      carId,
      acf.title           || acf.car_name || null,
      description         || null,
      acf.seo_title       || null,
      acf.seo_description || null,
    ]);

    let pageId;
    if (result.rows.length > 0) {
      pageId = result.rows[0].id;
      console.log(`  ✓ car_page для ${acf.car_name}, id: ${pageId}`);
    } else {
      const existing = await client.query(`SELECT id FROM car_pages WHERE car_id = $1`, [carId]);
      pageId = existing.rows[0]?.id;
      console.log(`  ℹ car_page для ${acf.car_name} уже существует`);
    }

    if (pageId) pageIds.push({ pageId, acf });
  }

  return pageIds;
}

async function seedReviews(client, pageEntries) {
  console.log('\n[5/6] Reviews...');
  let inserted = 0;
  let skipped  = 0;

  for (const { pageId, acf } of pageEntries) {
    if (!acf.review && !acf.author_review) {
      skipped++;
      continue;
    }

    const comment = stripHtml(acf.review);

    const exists = await client.query(`
      SELECT id FROM reviews WHERE car_page_id = $1 AND author = $2
    `, [pageId, acf.author_review || null]);

    if (exists.rows.length > 0) {
      skipped++;
      continue;
    }

    await client.query(`
      INSERT INTO reviews (car_page_id, rating, comment, author, author_image)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      pageId,
      5,
      comment,
      acf.author_review       || null,
      acf.author_review_foto  || null,
    ]);

    inserted++;
    console.log(`  ✓ Отзыв от "${acf.author_review}" (${acf.car_name})`);
  }

  console.log(`  Итого: вставлено ${inserted}, пропущено ${skipped}`);
}

async function printSummary(client) {
  console.log('\n[6/6] Итоговая статистика:');
  const tables = ['countries', 'tariffs', 'cars', 'car_prices', 'images', 'car_pages', 'reviews'];
  for (const t of tables) {
    const { rows } = await client.query(`SELECT COUNT(*) AS n FROM ${t}`);
    console.log(`  ${t.padEnd(15)} → ${rows[0].n} строк`);
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== DRIVOVO SEED: начало миграции ===');

  const dataPath = path.join(__dirname, 'data.json');
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
    /*const tariffIds =*/ await seedTariffs(client);  // зарезервировано для tariff_options
    const carEntries = await seedCars(client, data, countryId);
    const pageEntries = await seedCarPages(client, carEntries);
    await seedReviews(client, pageEntries);

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
