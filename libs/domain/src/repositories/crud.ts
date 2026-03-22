/**
 * Base search/pagination parameters shared across all repositories.
 */
export interface SearchParams {
  limit?: number;
  offset?: number;
  sortField?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Fields managed by the system (database / ORM), not by the caller.
 * Excluded from insert/update payloads so consumers cannot set or
 * override values that must be generated server-side.
 */
type SystemFields = 'id' | 'createdAt' | 'updatedAt';

/**
 * Generic CRUD repository port.
 *
 * - E: the domain entity type
 * - P: search params (must extend SearchParams)
 *
 * This interface lives in the domain layer and serves as the single
 * contract that infrastructure adapters must implement.
 * Application layer (use cases) depends on this port — never on
 * a concrete implementation.
 */
export interface CRUD<E, P extends SearchParams = SearchParams> {
  find(params: P): Promise<E[]>;
  findOne(id: string): Promise<E | null>;
  insert(data: Omit<E, SystemFields>): Promise<string>;
  update(id: string, data: Partial<Omit<E, SystemFields>>): Promise<void>;
  delete(id: string): Promise<void>;
}
