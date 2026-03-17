'use strict';

const fs = require('fs');
const path = require('path');

const { getClient } = require('./db');

const pipe = (...fns) => async (x) => {
  let res = x;
  for (const fn of fns) {
    res = await fn(res);
  }
  return res;
};

const readFile = (filePath) => {
  const raw = fs.readFileSync(path.resolve(filePath), 'utf-8');
  return JSON.parse(raw);
};

const insert = (tableName) => async (row) => {
  if (!row) return null;
  const keys = Object.keys(row);
  const values = Object.values(row);
  const { rows } = await getClient().query(`
    INSERT INTO ${tableName} (${keys.join(',')})
    VALUES (${values.map((_, i) => `$${i + 1}`).join(',')})
    ON CONFLICT DO NOTHING
    RETURNING *
  `, values);
  return rows[0] ?? null;
};

const many = (fn) => async (rows) => {
  const results = [];
  for (const row of rows) {
    results.push(await fn(row));
  }
  return results;
};

const stripHtml = (html) => {
  if (!html) return null;
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, '')
    .replace(/\s+/g, ' ')
    .trim() || null;
};

module.exports = { pipe, many, readFile, insert, stripHtml };
