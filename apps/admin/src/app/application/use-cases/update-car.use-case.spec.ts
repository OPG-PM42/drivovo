import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Injector } from '@angular/core';
import { of, throwError } from 'rxjs';
import { UpdateCarUseCase } from './update-car.use-case';
import { CarService } from '../ports/car.service';
import { ValidationError } from '../../domain/errors';
import { CarUpdate } from '../../domain/car';

describe('UpdateCarUseCase', () => {
  let useCase: UpdateCarUseCase;
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
        { provide: UpdateCarUseCase, useClass: UpdateCarUseCase },
        { provide: CarService, useValue: mock },
      ],
    });

    useCase = injector.get(UpdateCarUseCase);
    svc = mock;
  });

  it('delegates to CarService.update and returns updated car', (done) => {
    const payload: CarUpdate = { model: 'BMW X5' } as any;
    const updated = { id: '1', ...payload } as any;
    svc.update.mockReturnValue(of(updated));

    useCase.execute('1', payload).subscribe({
      next: (r) => {
        expect(r).toBe(updated);
        expect(svc.update).toHaveBeenCalledWith('1', payload);
        expect(svc.update).toHaveBeenCalledTimes(1);
        (done as () => void)();
      },
    });
  });

  it('propagates ValidationError on invalid update data', (done) => {
    const err = new ValidationError('Invalid update', { fields: { year: 'must be number' } });
    svc.update.mockReturnValue(throwError(() => err));

    useCase.execute('1', {} as any).subscribe({
      error: (e) => {
        expect(e).toBe(err);
        (done as () => void)();
      },
    });
  });
});
