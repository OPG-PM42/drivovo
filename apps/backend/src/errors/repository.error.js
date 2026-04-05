import { AppError } from './app.error';
import { DatabaseError } from 'pg';
import { PgErrors } from '../infrastructure/pg-errors.js';
import { RepositoryErrorType } from '../infrastructure/repository-error-types.js';

export class RepositoryError extends AppError {
  constructor(code, message, cause) {
    super(code, message, cause);
  }

  static from(err) {
    if (err instanceof DatabaseError && err.code) {
      const entry = PgErrors[err.code] || PgErrors[err.code.slice(0, 2)];
      if (entry) {
        return new RepositoryError(entry.type, entry.message(err), { cause: err });
      }
    }
    return new RepositoryError(RepositoryErrorType.UNKNOWN, err.message || 'Unexpected database error', { cause: err });
  }
}
