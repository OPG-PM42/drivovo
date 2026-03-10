'use strict';

function stripHtml(html) {
  if (!html) return null;
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, '')
    .replace(/\s+/g, ' ')
    .trim() || null;
}

function mapOrWarn(map, value, fieldName, carName) {
  if (!value) return null;
  const mapped = map[value];
  if (!mapped) {
    console.warn(`  ⚠  [${carName}] Неизвестное значение ${fieldName}: "${value}" → null`);
    return null;
  }
  return mapped;
}

module.exports = { stripHtml, mapOrWarn };
