export const dbErrors = {
  UNIQUE_VIOLATION: { code: 409, message: 'Duplicate entry' },
  NOT_NULL_VIOLATION: { code: 400, message: 'Missing required field' },
  FOREIGN_KEY_VIOLATION: { code: 400, message: 'Invalid reference' },
  CONSTRAINT_VIOLATION: { code: 400, message: 'Data constraint violated' },
  ACCESS_DENIED: { code: 403, message: 'Access denied' },
  CONNECTION_ERROR: { code: 503, message: 'Service temporarily unavailable' },
  RESOURCE_ERROR: { code: 503, message: 'Service temporarily unavailable' },
  SERVER_UNAVAILABLE: { code: 503, message: 'Service temporarily unavailable' },
  DATA_ERROR: { code: 400, message: 'Invalid data' },
  QUERY_ERROR: { code: 500, message: 'Internal error' },
  UNKNOWN_DATABASE_ERROR: { code: 500, message: 'Internal error' },
};
