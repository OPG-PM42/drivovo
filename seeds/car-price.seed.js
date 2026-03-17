'use strict';

const { insert } = require('./utils');

const format = ({ countryId, carId, acf }) => {
  const priceRaw = acf.calculator_props?.car_price_ex_showroom;
  const value = priceRaw ? parseFloat(priceRaw) : null;
  if (!value || isNaN(value)) return null;
  return {
    car_id: carId,
    country_id: countryId,
    value,
    currency: 'EUR',
  };
};

const insertCarPrice = async (entry) => insert('car_prices')(format(entry));

module.exports = { insertCarPrice };
