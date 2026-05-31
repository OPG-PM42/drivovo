export interface QueryResult<T = Record<string, unknown>> {
  rows: T[];
  rowCount: number;
}

export interface PoolClient {
  query<T = Record<string, unknown>>(
    sql: string,
    params?: unknown[]
  ): Promise<QueryResult<T>>;
  release(): void;
}

export interface Pool {
  query<T = Record<string, unknown>>(
    sql: string,
    params?: unknown[]
  ): Promise<QueryResult<T>>;
  connect(): Promise<PoolClient>;
  end(): Promise<void>;
}

export interface PoolConfig {
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  max?: number;
}

const store = new Map<string, Record<string, unknown>[]>();

const getTable = (sql: string): string => {
  const match = sql.match(/(?:FROM|INTO|UPDATE)\s+"?(\w+)"?/i);
  return match?.[1] ?? 'unknown';
};

const createMockClient = (): PoolClient => ({
  query: async <T = Record<string, unknown>>(
    sql: string,
    params: unknown[] = []
  ): Promise<QueryResult<T>> => {
    const table = getTable(sql);
    const rows = (store.get(table) ?? []) as T[];
    return { rows, rowCount: rows.length };
  },
  release: () => undefined,
});

export const createPool = (_config?: PoolConfig): Pool => {
  const pool: Pool = {
    query: async <T = Record<string, unknown>>(
      sql: string,
      _params: unknown[] = []
    ): Promise<QueryResult<T>> => {
      const table = getTable(sql);
      const rows = (store.get(table) ?? []) as T[];
      return { rows, rowCount: rows.length };
    },
    connect: async () => createMockClient(),
    end: async () => undefined,
  };

  return pool;
};

export const seedTable = (table: string, rows: Record<string, unknown>[]): void => {
  store.set(table, rows);
};

export const clearStore = (): void => {
  store.clear();
};
