'use strict';

const { COUNTRIES } = require('./data/country.data');

async function seedCountry(client) {
  console.log('\n[1/7] Countries...');

  for (const c of COUNTRIES) {
    const result = await client.query(`
      INSERT INTO countries (name, iso2, iso3, phone_code, currency)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (iso2) DO NOTHING
      RETURNING id
    `, [c.name, c.iso2, c.iso3, c.phoneCode, c.currency]);

    if (result.rows.length > 0) {
      console.log(`  ✓ ${c.name} вставлена, id:`, result.rows[0].id);
    } else {
      console.log(`  ℹ ${c.name} уже существует (пропущена)`);
    }
  }

  const { rows } = await client.query(`SELECT id FROM countries WHERE iso2 = $1`, [COUNTRIES[0].iso2]);
  return rows[0].id;
}

module.exports = { seedCountry };
