import { DatabaseError } from 'pg';
import { RepositoryError } from './repository.error.js';
import { RepositoryErrorType } from '../infrastructure/repository-error-types.js';

/** Helper: create a pg DatabaseError with the given code and optional fields. */
function makePgError(code, fields = {}) {
  // DatabaseError expects a raw message object from pg protocol
  const err = new DatabaseError('db error', 0, 'error');
  err.code = code;
  Object.assign(err, fields);
  return err;
}

describe('RepositoryError.from()', () => {
  // ── exact code mapping ────────────────────────────────────────────

  it('23505 → UNIQUE_VIOLATION with detail', () => {
    const pg = makePgError('23505', {
      detail: 'Key (id)=(1) already exists',
      constraint: 'cars_pkey',
    });
    const err = RepositoryError.from(pg);

    expect(err).toBeInstanceOf(RepositoryError);
    expect(err.code).toBe(RepositoryErrorType.UNIQUE_VIOLATION);
    expect(err.message).toContain('Duplicate entry');
    expect(err.message).toContain('Key (id)=(1) already exists');
  });

  it('23503 → FOREIGN_KEY_VIOLATION', () => {
    const pg = makePgError('23503', {
      detail: 'Key (brand_id)=(999) is not present in table "brands"',
      constraint: 'cars_brand_id_fkey',
    });
    const err = RepositoryError.from(pg);

    expect(err.code).toBe(RepositoryErrorType.FOREIGN_KEY_VIOLATION);
    expect(err.message).toContain('Reference error');
  });

  it('23502 → NOT_NULL_VIOLATION', () => {
    const pg = makePgError('23502', { column: 'name' });
    const err = RepositoryError.from(pg);

    expect(err.code).toBe(RepositoryErrorType.NOT_NULL_VIOLATION);
    expect(err.message).toContain('Missing required field: name');
  });

  it('42501 → ACCESS_DENIED', () => {
    const pg = makePgError('42501', { table: 'cars' });
    const err = RepositoryError.from(pg);

    expect(err.code).toBe(RepositoryErrorType.ACCESS_DENIED);
    expect(err.message).toContain('Permission denied');
    expect(err.message).toContain('cars');
  });

  // ── class-prefix fallback ─────────────────────────────────────────

  it('23999 (unknown in class 23) → CONSTRAINT_VIOLATION fallback', () => {
    const pg = makePgError('23999', { detail: 'some constraint detail' });
    const err = RepositoryError.from(pg);

    expect(err.code).toBe(RepositoryErrorType.CONSTRAINT_VIOLATION);
    expect(err.message).toContain('Constraint violated');
  });

  it('08006 (connection failure) → CONNECTION_ERROR', () => {
    const pg = makePgError('08006');
    const err = RepositoryError.from(pg);

    expect(err.code).toBe(RepositoryErrorType.CONNECTION_ERROR);
    expect(err.message).toContain('Database connection failed');
  });

  it('57014 (query cancelled) → SERVER_UNAVAILABLE', () => {
    const pg = makePgError('57014');
    const err = RepositoryError.from(pg);

    expect(err.code).toBe(RepositoryErrorType.SERVER_UNAVAILABLE);
  });

  // ── unknown / non-PG errors ───────────────────────────────────────

  it('totally unknown PG code → UNKNOWN_DATABASE_ERROR', () => {
    const pg = makePgError('99999');
    const err = RepositoryError.from(pg);

    expect(err.code).toBe(RepositoryErrorType.UNKNOWN);
  });

  it('non-DatabaseError → UNKNOWN_DATABASE_ERROR', () => {
    const err = RepositoryError.from(new TypeError('something broke'));

    expect(err.code).toBe(RepositoryErrorType.UNKNOWN);
    expect(err.message).toBe('something broke');
  });

  // ── cause chain ───────────────────────────────────────────────────

  it('preserves the original error as cause', () => {
    const pg = makePgError('23505', { detail: 'dup' });
    const err = RepositoryError.from(pg);

    expect(err.cause).toBeDefined();
  });
});
