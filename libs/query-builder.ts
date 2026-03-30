import { Pool, type QueryResultRow } from "pg";

const pool = new Pool({
  connectionString: process.env["DATABASE_URL"],
});

export { pool };

type WhereValue = string | number | undefined;

interface QueryOptions {
  table: string;
  fields: string[];
  where: Record<string, WhereValue>;
  order?: string;
  limit?: number;
}

export class Query<T extends QueryResultRow = QueryResultRow> {
  private options: QueryOptions;

  static create<T extends QueryResultRow = QueryResultRow>(table: string): Query<T> {
    return new Query<T>(table);
  }

  constructor(table: string) {
    this.options = { table, fields: ["*"], where: {} };
  }

  where<C extends { [K in keyof C]: WhereValue }>(conditions: C): this {
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

  then(
    resolve: (value: T[]) => void,
    reject?: (reason: unknown) => void,
  ): void {
    const { table, fields, where, limit, order } = this.options;
    const params: WhereValue[] = [];
    const cond = Object.entries(where)
      .filter(([, val]) => val !== undefined)
      .map(([key, val]) => {
        params.push(val);
        return `${key}=$${params.length}`;
      })
      .join(" AND ");
    let sql = `SELECT ${fields} FROM ${table}`;
    if (cond) sql += ` WHERE ${cond}`;
    if (order) sql += ` ORDER BY ${order}`;
    if (limit !== undefined) sql += ` LIMIT ${limit}`;

    pool
      .query<T>(sql, params)
      .then((result) => resolve(result.rows))
      .catch((err: unknown) => {
        if (reject) reject(err);
      });
  }
}
