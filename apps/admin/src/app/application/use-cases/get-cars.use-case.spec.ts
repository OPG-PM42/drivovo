import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Injector } from '@angular/core';
import { of, throwError } from 'rxjs';
import { GetCarsUseCase } from './get-cars.use-case';
import { CarRepository } from '../ports/car.repository';
import { ApiError } from '../../domain/errors';

describe('GetCarsUseCase', () => {
  let useCase: GetCarsUseCase;
  let repo: jest.Mocked<CarRepository>;

  beforeEach(() => {
    const mock: jest.Mocked<CarRepository> = {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<CarRepository>;

    const injector = Injector.create({
      providers: [
        { provide: GetCarsUseCase, useClass: GetCarsUseCase },
        { provide: CarRepository, useValue: mock },
      ],
    });

    useCase = injector.get(GetCarsUseCase);
    repo = mock;
  });

  it('delegates to CarRepository.getAll and returns result', (done) => {
    const result = { items: [{ id: '1' } as any], total: 1 };
    repo.getAll.mockReturnValue(of(result));

    useCase.execute().subscribe({
      next: (r) => {
        expect(r).toBe(result);
        expect(repo.getAll).toHaveBeenCalledTimes(1);
        (done as () => void)();
      },
    });
  });

  it('propagates ApiError from repository', (done) => {
    const err = new ApiError(500, 'internal error');
    repo.getAll.mockReturnValue(throwError(() => err));

    useCase.execute().subscribe({
      error: (e) => {
        expect(e).toBe(err);
        (done as () => void)();
      },
    });
  });
});
