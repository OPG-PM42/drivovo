'use strict';

const { insert } = require('./utils');

const IMAGE_FIELDS = [
  'preview_photo', 'crop_1', 'crop_2', 'crop_3', 'crop_4',
  'adphoto_1', 'adphoto_2', 'adphoto_3',
];

const format = ({ carId, acf }) =>
  IMAGE_FIELDS
    .map((f) => acf[f])
    .filter((url) => url && typeof url === 'string' && url.startsWith('http'))
    .map((url) => ({
      parent_id: carId,
      parent_type: 'car',
      url,
      alt: acf.car_name || null,
    }));

const insertCarImages = async (entry) => {
  const rows = format(entry);
  for (const row of rows) {
    await insert('images')(row);
  }
};

module.exports = { insertCarImages };
