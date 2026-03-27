'use strict';

interface QueryOptions {
  table: string;
  fields: string[];
  where: Record<string, string | number | undefined>;
  order?: string;
  limit?: number;
}

export class Query {
  private options: QueryOptions;

  constructor(table: string) {
    this.options = { table, fields: ['*'], where: {} };
  }

  where(conditions: Record<string, string | number | undefined>): this {
    Object.assign(this.options.where, conditions);
    return this;
  }

  order(field: string): this {
    this.options.order = field;
    return this;
  }

  limit(count: number): this {
    this.options.limit = count;
    return this;
  }

  then(resolve: (value: string) => void): void {
    const { table, fields, where, limit, order } = this.options;
    const cond = Object.entries(where)
      .map(([key, val]) => `${key}='${val}'`)
      .join(' AND ');
    let sql = `SELECT ${fields} FROM ${table}`;
    if (cond) sql += ` WHERE ${cond}`;
    if (order) sql += ` ORDER BY ${order}`;
    if (limit) sql += ` LIMIT ${limit}`;
    resolve(sql);
  }
}

// Usage

// (async () => {

//   const sql = await new Query('cities')
//     .where({ country: 10, type: 1 })
//     .order('population')
//     .limit(10);
//   console.log(sql);

// })();
