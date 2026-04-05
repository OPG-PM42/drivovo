/**
 * Integration test: full error chain from DatabaseError → HTTP response.
 *
 * Simulates what happens when PostgreSQL returns a duplicate-key error:
 *   DatabaseError → RepositoryError.from() → ServiceError → endpoint error mapping → HTTP 409
 */
import { DatabaseError } from 'pg';
import { RepositoryError } from './repository.error.js';
import { ServiceError } from './service.error.js';
import { createCarService } from '../domain/services/car.js';
import { createCarEndpoint } from '../endpoints/car.js';

/** Simulates the repository catch block: RepositoryError.from(dbError) */
function repoThatThrows(dbError) {
  return {
    find: async () => {
      throw RepositoryError.from(dbError);
    },
  };
}

/** Simulates Fastify's error handler from main.js */
function simulateHttpResponse(endpoint, err) {
  const errInfo = err.code ? endpoint.errors?.[err.code] : null;
  if (errInfo) {
    return { status: errInfo.code, body: { code: errInfo.code, error: errInfo.message } };
  }
  return { status: 500, body: { error: 'Internal Server Error' } };
}

describe('Full error chain: PostgreSQL → HTTP response', () => {
  it('23505 unique violation → HTTP 409 with safe message', async () => {
    // Step 0: PostgreSQL throws DatabaseError
    const pgErr = new DatabaseError('db error', 0, 'error');
    pgErr.code = '23505';
    pgErr.detail = 'Key (id)=(1) already exists';
    pgErr.table = 'cars';
    pgErr.constraint = 'cars_pkey';

    // Step 1: Repository converts to RepositoryError
    const service = createCarService({ cars: repoThatThrows(pgErr) });

    // Step 2: Build endpoint with error mapping
    const domain = { cars: service };
    const [endpoint] = createCarEndpoint(domain);

    // Step 3: Service throws ServiceError (caught by endpoint handler)
    let caughtErr;
    try {
      await endpoint.handler({});
    } catch (err) {
      caughtErr = err;
    }

    expect(caughtErr).toBeInstanceOf(ServiceError);
    expect(caughtErr.code).toBe('UNIQUE_VIOLATION');

    // Step 4: main.js maps to HTTP response
    const response = simulateHttpResponse(endpoint, caughtErr);

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ code: 409, error: 'Duplicate entry' });
    // No internal details leaked
    expect(JSON.stringify(response.body)).not.toContain('Key (id)');
    expect(JSON.stringify(response.body)).not.toContain('cars_pkey');
  });

  it('23502 not-null violation → HTTP 400', async () => {
    const pgErr = new DatabaseError('db error', 0, 'error');
    pgErr.code = '23502';
    pgErr.column = 'name';

    const service = createCarService({ cars: repoThatThrows(pgErr) });
    const [endpoint] = createCarEndpoint({ cars: service });

    let caughtErr;
    try {
      await endpoint.handler({});
    } catch (err) {
      caughtErr = err;
    }

    const response = simulateHttpResponse(endpoint, caughtErr);
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Missing required field');
  });

  it('08006 connection failure → HTTP 503', async () => {
    const pgErr = new DatabaseError('db error', 0, 'error');
    pgErr.code = '08006';

    const service = createCarService({ cars: repoThatThrows(pgErr) });
    const [endpoint] = createCarEndpoint({ cars: service });

    let caughtErr;
    try {
      await endpoint.handler({});
    } catch (err) {
      caughtErr = err;
    }

    const response = simulateHttpResponse(endpoint, caughtErr);
    expect(response.status).toBe(503);
    expect(response.body.error).toBe('Service temporarily unavailable');
  });

  it('unknown error without code → HTTP 500 generic', async () => {
    const repo = {
      find: async () => { throw new Error('unexpected'); },
    };
    const service = createCarService({ cars: repo });
    const [endpoint] = createCarEndpoint({ cars: service });

    let caughtErr;
    try {
      await endpoint.handler({});
    } catch (err) {
      caughtErr = err;
    }

    // Service wraps as CARS_FETCH_FAILED
    expect(caughtErr.code).toBe('CARS_FETCH_FAILED');

    const response = simulateHttpResponse(endpoint, caughtErr);
    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Failed to retrieve cars');
  });
});
