'use strict';

const { pipe, insert, getClient, stripHtml } = require('./utils');

const formatPage = ({ carId, acf }) => ({
  car_id: carId,
  title: acf.title || acf.car_name || null,
  description: [acf.prm_1, acf.prm_2, acf.prm_3]
    .filter(Boolean)
    .join('\n') || null,
  seo_title: acf.seo_title || null,
  seo_description: acf.seo_description || null,
});

const formatReview = ({ acf }) => {
  if (!acf.review && !acf.author_review) return null;
  return {
    rating: 5,
    comment: stripHtml(acf.review),
    author: acf.author_review || null,
    authorImage: acf.author_review_foto || null,
  };
};

const insertCarPage = async (entry) => {
  let page = await pipe(formatPage, insert('car_pages'))(entry);

  let pageId = page?.id;
  if (!pageId) {
    const { rows } = await getClient().query(
      'SELECT id FROM car_pages WHERE car_id = $1',
      [entry.carId],
    );
    pageId = rows[0]?.id;
  }

  if (!pageId) return;

  const review = formatReview(entry);
  if (!review) return;

  const { rows: existing } = await getClient().query(`
    SELECT 1
    FROM car_pages, jsonb_array_elements(reviews) AS r
    WHERE id = $1 AND r->>'author' = $2
    LIMIT 1
  `, [pageId, review.author]);

  if (existing.length > 0) return;

  await getClient().query(`
    UPDATE car_pages
    SET reviews = reviews || $2::jsonb
    WHERE id = $1
  `, [pageId, JSON.stringify(review)]);
};

module.exports = { insertCarPage };
