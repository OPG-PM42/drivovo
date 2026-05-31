import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Injector } from '@angular/core';
import { of, throwError } from 'rxjs';
import { GetCarsUseCase } from './get-cars.use-case';
import { CarService } from '../ports/car.service';
import { ApiError } from '../../domain/errors';

describe('GetCarsUseCase', () => {
  let useCase: GetCarsUseCase;
  let svc: jest.Mocked<CarService>;

  beforeEach(() => {
    const mock: jest.Mocked<CarService> = {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<CarService>;

    const injector = Injector.create({
      providers: [
        { provide: GetCarsUseCase, useClass: GetCarsUseCase },
        { provide: CarService, useValue: mock },
      ],
    });

    useCase = injector.get(GetCarsUseCase);
    svc = mock;
  });

  it('delegates to CarService.getAll and returns result', (done) => {
    const result = { items: [{ id: '1' } as any], total: 1 };
    svc.getAll.mockReturnValue(of(result));

    useCase.execute().subscribe({
      next: (r) => {
        expect(r).toBe(result);
        expect(svc.getAll).toHaveBeenCalledTimes(1);
        (done as () => void)();
      },
    });
  });

  it('propagates ApiError from service', (done) => {
    const err = new ApiError(500, 'internal error');
    svc.getAll.mockReturnValue(throwError(() => err));

    useCase.execute().subscribe({
      error: (e) => {
        expect(e).toBe(err);
        (done as () => void)();
      },
    });
  });
});
