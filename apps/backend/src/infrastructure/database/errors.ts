export const DATABASE_ERRORS = {
  CONNECTION_ERROR: 'CONNECTION_ERROR',
  QUERY_ERROR: 'QUERY_ERROR',
  TRANSACTION_ERROR: 'TRANSACTION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  DUPLICATE_ERROR: 'DUPLICATE_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  CANCELLED_ERROR: 'CANCELLED_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export const PG_ERROR_MAP: Record<string, { code: string; message: string }> = {
  // Connection (08xxx)
  '08001': { code: DATABASE_ERRORS.CONNECTION_ERROR, message: 'Unable to establish connection' },
  '08003': { code: DATABASE_ERRORS.CONNECTION_ERROR, message: 'Connection does not exist' },
  '08004': { code: DATABASE_ERRORS.CONNECTION_ERROR, message: 'Server rejected connection' },
  '08006': { code: DATABASE_ERRORS.CONNECTION_ERROR, message: 'Connection failure' },

  // Integrity constraints (23xxx)
  '23502': { code: DATABASE_ERRORS.VALIDATION_ERROR, message: 'Required field is missing' },
  '23503': { code: DATABASE_ERRORS.VALIDATION_ERROR, message: 'Referenced record does not exist' },
  '23505': { code: DATABASE_ERRORS.DUPLICATE_ERROR, message: 'Record already exists' },
  '23514': { code: DATABASE_ERRORS.VALIDATION_ERROR, message: 'Value violates constraint' },

  // Data type (22xxx)
  '22001': { code: DATABASE_ERRORS.VALIDATION_ERROR, message: 'Value is too long' },
  '22003': { code: DATABASE_ERRORS.VALIDATION_ERROR, message: 'Numeric value out of range' },
  '22007': { code: DATABASE_ERRORS.VALIDATION_ERROR, message: 'Invalid date format' },
  '22P02': { code: DATABASE_ERRORS.VALIDATION_ERROR, message: 'Invalid value format' },

  // Authorization (28xxx)
  '28000': { code: DATABASE_ERRORS.PERMISSION_ERROR, message: 'Authorization failed' },
  '28P01': { code: DATABASE_ERRORS.PERMISSION_ERROR, message: 'Invalid credentials' },

  // Transaction (40xxx)
  '40001': { code: DATABASE_ERRORS.TRANSACTION_ERROR, message: 'Transaction conflict, please retry' },
  '40P01': { code: DATABASE_ERRORS.TRANSACTION_ERROR, message: 'Deadlock detected' },

  // Query cancellation (57xxx)
  '57014': { code: DATABASE_ERRORS.CANCELLED_ERROR, message: 'Operation was cancelled' },
  '57P01': { code: DATABASE_ERRORS.TIMEOUT_ERROR, message: 'Server is shutting down' },
};

export class RepositoryError extends Error {
  public readonly name: string = 'RepositoryError';

  static create(error: any) {
    if (error instanceof RepositoryError) {
      return error;
    }
    const { code, message } = error?.code ? PG_ERROR_MAP[error.code] : { code: DATABASE_ERRORS.UNKNOWN_ERROR, message: 'Unknown Repository Error' };
    return new RepositoryError(code, message, { cause: error });
  }

  constructor(public readonly code: string, message: string, options?: { cause?: Error }) {
    super(message, options);
  }
}
