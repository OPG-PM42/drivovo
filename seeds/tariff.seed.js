'use strict';

const { pipe, insert } = require('./utils');

const format = (t) => ({
  type: t.type,
  name: t.name,
});

const insertTariff = pipe(format, insert('tariffs'));

module.exports = { insertTariff };
