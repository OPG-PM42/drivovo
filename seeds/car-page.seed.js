'use strict';

const { stripHtml } = require('./utils');

async function seedCarPages(client, carEntries) {
  console.log('\n[6/7] Car pages & reviews...');
  let pagesInserted  = 0;
  let reviewsInserted = 0;
  let reviewsSkipped  = 0;

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
      pagesInserted++;
      console.log(`  ✓ car_page для ${acf.car_name}, id: ${pageId}`);
    } else {
      const existing = await client.query(`SELECT id FROM car_pages WHERE car_id = $1`, [carId]);
      pageId = existing.rows[0]?.id;
      console.log(`  ℹ car_page для ${acf.car_name} уже существует`);
    }

    if (!pageId || (!acf.review && !acf.author_review)) {
      if (pageId) reviewsSkipped++;
      continue;
    }

    const comment     = stripHtml(acf.review);
    const author      = acf.author_review      || null;
    const authorImage = acf.author_review_foto || null;

    const exists = await client.query(`
      SELECT 1
      FROM car_pages,
           jsonb_array_elements(reviews) AS r
      WHERE id = $1
        AND r->>'author' = $2
      LIMIT 1
    `, [pageId, author]);

    if (exists.rows.length > 0) {
      reviewsSkipped++;
      continue;
    }

    await client.query(`
      UPDATE car_pages
      SET reviews = reviews || $2::jsonb
      WHERE id = $1
    `, [
      pageId,
      JSON.stringify({
        rating: 5,
        comment,
        author,
        authorImage,
      }),
    ]);

    reviewsInserted++;
    console.log(`     ↳ Отзыв от "${author}"`);
  }

  console.log(`  Итого: ${pagesInserted} страниц, ${reviewsInserted} отзывов (пропущено ${reviewsSkipped})`);
}

module.exports = { seedCarPages };
