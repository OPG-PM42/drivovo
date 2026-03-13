import fs from 'fs/promises';

export const pipe = (...fns) => async (x) => {
  let res = x;
  for (const fn of fns) {
    res = await fn(res);
  }
  return res;
};

export const readFile = async (path) => {
  const raw = await fs.readFile(path, 'utf8')
  return JSON.parse(raw);
};

export const insert = (tabletName) => async (row) => {
  const keys = Object.keys(row);
  const values = Object.values(row);
  await client.query(`
    INSERT INTO ${tabletName}
      (${keys.join(',')})
    VALUES (${values.map((_, i) => `$${i + 1}`).join(',')})
    ON CONFLICT DO NOTHING
    RETURNING id
  `, values);
}