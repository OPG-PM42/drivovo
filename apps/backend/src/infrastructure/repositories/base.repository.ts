import { pg, pgInsert, pgUpdate, pgDelete } from '@metarhia/sql';
import type { PgSelectBuilder, QueryValue } from '@metarhia/sql';
import type { Pool } from '../pg/mock-pg';
import type { SearchParams } from '@drivovo/domain';

type SystemFields = 'id' | 'createdAt' | 'updatedAt';

/**
 * Maps a (camelCase) source field name to the (snake_case) DB column.
 * Used both for equality search filters and partial UPDATE payloads.
 */
export type FieldMap<T> = Partial<Record<keyof T, string>>;

/**
 * Abstract base PostgreSQL repository implementing generic CRUD
 * operations via @metarhia/sql query builder.
 *
 * Concrete repositories extend this class and provide:
 *   - table name, column list, sort-field whitelist
 *   - row→entity mapping
 *   - field maps for search filters and partial updates
 *
 * All SQL is built through the query builder — no manual string
 * concatenation or parameter indexing.
 *
 * @typeParam Entity  - domain entity type
 * @typeParam Row     - database row type (snake_case columns)
 * @typeParam Params  - search params extending SearchParams
 */
export abstract class PostgresRepository<
  Entity,
  Row,
  Params extends SearchParams = SearchParams,
> {
  /**
   * Maps search-param keys to DB columns for simple equality filters.
   * The default `applySearchFilters` iterates this map and applies
   * `whereEq` for every defined value. Subclasses override
   * `applySearchFilters` only when they need non-equality conditions
   * (LIKE, BETWEEN, joins, etc.) on top of the map.
   */
  protected readonly searchFieldMap: FieldMap<Params> = {};

  /** Whether the table has created_at / updated_at columns. */
  protected readonly hasTimestamps: boolean = false;

  /** Database table name. */
  protected abstract readonly table: string;

  /** Column names for SELECT projection. */
  protected abstract readonly columns: string[];

  /**
   * Whitelist mapping camelCase entity field names to snake_case
   * DB column names. Only these columns are allowed in ORDER BY,
   * preventing SQL injection through user-supplied sort fields.
   */
  protected abstract readonly sortFieldMap: Record<string, string>;

  /** Default ORDER BY column when no sortField is specified. */
  protected abstract readonly defaultSortColumn: string;

  constructor(protected readonly pool: Pool) {}

  public async findOne(id: string): Promise<Entity | null> {
    const query = pg()
      .select(...this.columns)
      .from(this.table)
      .whereEq('id', id);

    const { rows } = await this.pool.query<Row>(
      query.build(),
      query.buildParams(),
    );
    return rows[0] ? this.rowToEntity(rows[0]) : null;
  }

  public async find(params: Params): Promise<Entity[]> {
    const query = pg()
      .select(...this.columns)
      .from(this.table);

    this.applySearchFilters(query, params);

    const sortColumn =
      this.sortFieldMap[params.sortField ?? ''] ?? this.defaultSortColumn;
    query.orderBy(sortColumn, params.sortOrder ?? 'DESC');

    if (params.limit !== undefined) query.limit(params.limit);
    if (params.offset !== undefined) query.offset(params.offset);

    const { rows } = await this.pool.query<Row>(
      query.build(),
      query.buildParams(),
    );
    return rows.map((row) => this.rowToEntity(row));
  }

  public async insert(data: Omit<Entity, SystemFields>): Promise<string> {
    const values = this.entityToRow(data);
    const query = pgInsert()
      .table(this.table)
      .values(values)
      .returning('id');

    const { rows } = await this.pool.query<{ id: string }>(
      query.build(),
      query.buildParams(),
    );
    return rows[0].id;
  }

  public async update(
    id: string,
    data: Partial<Omit<Entity, SystemFields>>,
  ): Promise<void> {
    const values = this.partialEntityToRow(data);
    if (Object.keys(values).length === 0) return;

    const query = pgUpdate().table(this.table).sets(values);
    if (this.hasTimestamps) query.set('updated_at', new Date());
    query.whereEq('id', id);

    await this.pool.query(query.build(), query.buildParams());
  }

  public async delete(id: string): Promise<void> {
    const query = pgDelete().from(this.table).whereEq('id', id);
    await this.pool.query(query.build(), query.buildParams());
  }

  /** Convert a database row (snake_case) to a domain entity (camelCase). */
  protected abstract rowToEntity(row: Row): Entity;

  /** Convert full entity data to DB column→value pairs for INSERT. */
  protected abstract entityToRow(
    data: Omit<Entity, SystemFields>,
  ): Record<string, unknown>;

  /** Convert partial entity data to DB column→value pairs for UPDATE. */
  protected abstract partialEntityToRow(
    data: Partial<Omit<Entity, SystemFields>>,
  ): Record<string, unknown>;

  /**
   * Apply entity-specific WHERE conditions to the SELECT builder.
   * Default implementation derives equality filters from
   * `searchFieldMap`. Override only to add non-equality conditions.
   */
  protected applySearchFilters(query: PgSelectBuilder, params: Params): void {
    this.applyEqualityFilters(query, params);
  }

  /** Apply `whereEq` for every key in `searchFieldMap` with a defined value. */
  protected applyEqualityFilters(
    query: PgSelectBuilder,
    params: Params,
  ): void {
    for (const key of Object.keys(this.searchFieldMap) as Array<keyof Params>) {
      const value = params[key];
      if (value === undefined) continue;
      const column = this.searchFieldMap[key];
      if (column) query.whereEq(column, value as QueryValue);
    }
  }

  /**
   * Build a partial DB row from a source object using a field map.
   * Skips undefined values — only defined fields are emitted, so the
   * result is safe to pass to UPDATE without overwriting columns the
   * caller did not intend to change.
   */
  protected mapDefinedFields<T>(
    data: T,
    fieldMap: FieldMap<T>,
  ): Record<string, unknown> {
    const row: Record<string, unknown> = {};
    for (const key of Object.keys(fieldMap) as Array<keyof T>) {
      const value = data[key];
      if (value === undefined) continue;
      const column = fieldMap[key];
      if (column) row[column] = value;
    }
    return row;
  }

  /**
   * Find a single entity by an arbitrary column value.
   * Convenience helper for methods like findByEmail, findByPhone, etc.
   */
  protected async findBy(
    column: string,
    value: QueryValue,
  ): Promise<Entity | null> {
    const query = pg()
      .select(...this.columns)
      .from(this.table)
      .whereEq(column, value);

    const { rows } = await this.pool.query<Row>(
      query.build(),
      query.buildParams(),
    );
    return rows[0] ? this.rowToEntity(rows[0]) : null;
  }
}
