'use strict';

async function seedCarPrices(client, carEntries, countryId) {
  console.log('\n[4/7] Car prices...');
  let inserted = 0;

  for (const { carId, acf } of carEntries) {
    const priceRaw = acf.calculator_props?.car_price_ex_showroom;
    const price    = priceRaw ? parseFloat(priceRaw) : null;

    if (price && !isNaN(price)) {
      await client.query(`
        INSERT INTO car_prices (car_id, country_id, value, currency)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (car_id, country_id) DO NOTHING
      `, [carId, countryId, price, 'EUR']);
      inserted++;
    } else {
      console.warn(`  ⚠  ${acf.car_name}: цена отсутствует или не число ("${priceRaw}")`);
    }
  }

  console.log(`  Итого: вставлено ${inserted} цен`);
}

module.exports = { seedCarPrices };
