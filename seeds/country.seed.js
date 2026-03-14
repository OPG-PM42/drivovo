'use strict';

const { pipe, insert } = require('./utils');

const format = (c) => ({
  name: c.name,
  iso2: c.iso2,
  iso3: c.iso3,
  phone_code: c.phoneCode,
  currency: c.currency,
});

const insertCountry = pipe(format, insert('countries'));

module.exports = { insertCountry };
