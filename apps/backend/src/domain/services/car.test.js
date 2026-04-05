import { createCarService } from './car.js';
import { ServiceError } from '../../errors/service.error.js';
import { RepositoryError } from '../../errors/repository.error.js';
import { RepositoryErrorType } from '../../infrastructure/repository-error-types.js';

describe('CarService error propagation', () => {
  it('propagates RepositoryError code through ServiceError', async () => {
    const repoError = new RepositoryError(
      RepositoryErrorType.UNIQUE_VIOLATION,
      'Duplicate entry: Key (id)=(1) already exists',
    );

    const service = createCarService({
      cars: { find: () => Promise.reject(repoError) },
    });

    await expect(service.find()).rejects.toThrow(ServiceError);

    try {
      await service.find();
    } catch (err) {
      expect(err).toBeInstanceOf(ServiceError);
      expect(err.code).toBe('UNIQUE_VIOLATION');
      expect(err.message).toContain('Duplicate entry');
    }
  });

  it('uses CARS_FETCH_FAILED for errors without code', async () => {
    const service = createCarService({
      cars: { find: () => Promise.reject(new Error('network error')) },
    });

    try {
      await service.find();
    } catch (err) {
      expect(err).toBeInstanceOf(ServiceError);
      expect(err.code).toBe('CARS_FETCH_FAILED');
    }
  });

  it('preserves the original error as cause', async () => {
    const original = new RepositoryError(
      RepositoryErrorType.CONNECTION_ERROR,
      'Database connection failed',
    );

    const service = createCarService({
      cars: { find: () => Promise.reject(original) },
    });

    try {
      await service.find();
    } catch (err) {
      expect(err.cause).toBe(original);
    }
  });
});
