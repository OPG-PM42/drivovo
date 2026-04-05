import { dbErrors } from './http-error-map.js';
import { RepositoryErrorType } from '../infrastructure/repository-error-types.js';

describe('HTTP error mapping', () => {
  it('UNIQUE_VIOLATION → 409 Duplicate entry', () => {
    const mapped = dbErrors[RepositoryErrorType.UNIQUE_VIOLATION];
    expect(mapped.code).toBe(409);
    expect(mapped.message).toBe('Duplicate entry');
  });

  it('NOT_NULL_VIOLATION → 400', () => {
    const mapped = dbErrors[RepositoryErrorType.NOT_NULL_VIOLATION];
    expect(mapped.code).toBe(400);
    expect(mapped.message).toBe('Missing required field');
  });

  it('FOREIGN_KEY_VIOLATION → 400', () => {
    const mapped = dbErrors[RepositoryErrorType.FOREIGN_KEY_VIOLATION];
    expect(mapped.code).toBe(400);
  });

  it('ACCESS_DENIED → 403', () => {
    const mapped = dbErrors[RepositoryErrorType.ACCESS_DENIED];
    expect(mapped.code).toBe(403);
  });

  it('CONNECTION_ERROR → 503', () => {
    const mapped = dbErrors[RepositoryErrorType.CONNECTION_ERROR];
    expect(mapped.code).toBe(503);
  });

  it('UNKNOWN_DATABASE_ERROR → 500', () => {
    const mapped = dbErrors[RepositoryErrorType.UNKNOWN];
    expect(mapped.code).toBe(500);
  });

  it('every RepositoryErrorType has a mapping (except UNKNOWN key name)', () => {
    for (const [key, value] of Object.entries(RepositoryErrorType)) {
      expect(dbErrors[value]).toBeDefined();
    }
  });

  it('hides internal details in client messages', () => {
    for (const entry of Object.values(dbErrors)) {
      // Messages should not leak table names, column names, or SQL details
      // No raw PG details like "Key (id)=(1)", constraint names, SQL fragments
      expect(entry.message).not.toMatch(/Key \(/);
      expect(entry.message).not.toMatch(/_pkey|_fkey|_check/);
      expect(entry.message).not.toMatch(/SELECT|INSERT|UPDATE|DELETE/i);
    }
  });
});
