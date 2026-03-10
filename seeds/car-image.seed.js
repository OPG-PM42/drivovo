'use strict';

const IMAGE_FIELDS = ['preview_photo', 'crop_1', 'crop_2', 'crop_3', 'crop_4', 'adphoto_1', 'adphoto_2', 'adphoto_3'];

function collectImages(acf) {
  return IMAGE_FIELDS
    .map(f => acf[f])
    .filter(url => url && typeof url === 'string' && url.startsWith('http'));
}

async function seedCarImages(client, carEntries) {
  console.log('\n[5/7] Car images...');
  let total = 0;

  for (const { carId, acf } of carEntries) {
    const imageUrls = collectImages(acf);
    for (const url of imageUrls) {
      await client.query(`
        INSERT INTO images (parent_id, parent_type, url, alt)
        VALUES ($1, 'car', $2, $3)
        ON CONFLICT DO NOTHING
      `, [carId, url, acf.car_name || null]);
    }
    total += imageUrls.length;
  }

  console.log(`  Итого: ${total} изображений`);
}

module.exports = { seedCarImages };
