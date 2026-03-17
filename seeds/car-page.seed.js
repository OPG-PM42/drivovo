'use strict';

const { pipe, insert, stripHtml } = require('./utils');

const formatReview = ({ acf }) => {
  if (!acf.review && !acf.author_review) return null;
  return {
    rating: 5,
    comment: stripHtml(acf.review),
    author: acf.author_review || null,
    authorImage: acf.author_review_foto || null,
  };
};

const formatPage = (entry) => {
  const { carId, acf } = entry;
  const review = formatReview(entry);
  return {
    car_id: carId,
    title: acf.title || acf.car_name || null,
    description: [acf.prm_1, acf.prm_2, acf.prm_3]
      .filter(Boolean)
      .join('\n') || null,
    seo_title: acf.seo_title || null,
    seo_description: acf.seo_description || null,
    reviews: review ? JSON.stringify([review]) : null,
  };
};

const insertCarPage = (entry) => pipe(formatPage, insert('car_pages'))(entry);

module.exports = { insertCarPage };
