'use strict';

const { TARIFFS } = require('./data/tariff.data');

async function seedTariffs(client) {
  console.log('\n[2/7] Tariffs...');

  const ids = {};
  for (const t of TARIFFS) {
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

module.exports = { seedTariffs };
