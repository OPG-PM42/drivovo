'use strict';

async function printSummary(client) {
  console.log('\n[7/7] Итоговая статистика:');
  const tables = ['countries', 'tariffs', 'cars', 'car_prices', 'images', 'car_pages'];
  for (const t of tables) {
    const { rows } = await client.query(`SELECT COUNT(*) AS n FROM ${t}`);
    console.log(`  ${t.padEnd(15)} → ${rows[0].n} строк`);
  }
}

module.exports = { printSummary };
