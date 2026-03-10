'use strict';

const { ENGINE_TYPE_MAP, DRIVE_TYPE_MAP, BODY_TYPE_MAP, STATUS_MAP, INTERIOR_MAP } = require('./maps');
const { mapOrWarn } = require('./utils');

async function seedCars(client, data) {
  console.log('\n[3/7] Cars...');
  const carEntries = [];

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

    carEntries.push({ carId, acf });
  }

  return carEntries;
}

module.exports = { seedCars };
