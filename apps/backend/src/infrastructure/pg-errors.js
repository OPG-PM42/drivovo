import { RepositoryErrorType } from './repository-error-types.js';

/**
 * Maps PostgreSQL error codes to domain error types.
 * Lookup order: exact code first (e.g. '23505'), then 2-char class prefix (e.g. '23').
 * See: https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
export const PgErrors = {
  // Exact codes
  '23505': {
    type: RepositoryErrorType.UNIQUE_VIOLATION,
    message: ({ detail, constraint }) => `Duplicate entry: ${detail || constraint}`,
  },
  '23503': {
    type: RepositoryErrorType.FOREIGN_KEY_VIOLATION,
    message: ({ detail, constraint }) => `Reference error: ${detail || constraint}`,
  },
  '23502': {
    type: RepositoryErrorType.NOT_NULL_VIOLATION,
    message: ({ column }) => `Missing required field: ${column}`,
  },
  '42501': {
    type: RepositoryErrorType.ACCESS_DENIED,
    message: ({ table }) => `Permission denied${table ? ` for table ${table}` : ''}`,
  },

  // Class prefixes (fallback)
  '23': {
    type: RepositoryErrorType.CONSTRAINT_VIOLATION,
    message: ({ detail }) => `Constraint violated: ${detail || 'unknown constraint'}`,
  },
  '08': {
    type: RepositoryErrorType.CONNECTION_ERROR,
    message: () => 'Database connection failed',
  },
  '22': {
    type: RepositoryErrorType.DATA_ERROR,
    message: ({ detail }) => `Invalid data: ${detail || 'data exception'}`,
  },
  '42': {
    type: RepositoryErrorType.QUERY_ERROR,
    message: ({ message }) => `Query error: ${message}`,
  },
  '53': {
    type: RepositoryErrorType.RESOURCE_ERROR,
    message: () => 'Database resource limit reached',
  },
  '57': {
    type: RepositoryErrorType.SERVER_UNAVAILABLE,
    message: () => 'Database server unavailable',
  },
};
