import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Injector } from '@angular/core';
import { of, throwError } from 'rxjs';
import { CreateCarUseCase } from './create-car.use-case';
import { CarService } from '../ports/car.service';
import { ValidationError } from '../../domain/errors';
import { CarCreate } from '../../domain/car';

describe('CreateCarUseCase', () => {
  let useCase: CreateCarUseCase;
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
        { provide: CreateCarUseCase, useClass: CreateCarUseCase },
        { provide: CarService, useValue: mock },
      ],
    });

    useCase = injector.get(CreateCarUseCase);
    svc = mock;
  });

  it('delegates to CarService.create and returns the new car', (done) => {
    const payload: CarCreate = { model: 'BMW', year: 2023 } as any;
    const created = { id: '1', ...payload } as any;
    svc.create.mockReturnValue(of(created));

    useCase.execute(payload).subscribe({
      next: (r) => {
        expect(r).toBe(created);
        expect(svc.create).toHaveBeenCalledWith(payload);
        expect(svc.create).toHaveBeenCalledTimes(1);
        (done as () => void)();
      },
    });
  });

  it('propagates ValidationError on invalid data', (done) => {
    const err = new ValidationError('Invalid car data', { fields: { model: 'required' } });
    svc.create.mockReturnValue(throwError(() => err));

    useCase.execute({} as any).subscribe({
      error: (e) => {
        expect(e).toBe(err);
        (done as () => void)();
      },
    });
  });
});
