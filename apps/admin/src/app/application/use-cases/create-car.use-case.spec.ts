import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Injector } from '@angular/core';
import { of, throwError } from 'rxjs';
import { CreateCarUseCase } from './create-car.use-case';
import { CarRepository } from '../ports/car.repository';
import { ValidationError } from '../../domain/errors';
import { CarCreate } from '../../domain/car';

describe('CreateCarUseCase', () => {
  let useCase: CreateCarUseCase;
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
        { provide: CreateCarUseCase, useClass: CreateCarUseCase },
        { provide: CarRepository, useValue: mock },
      ],
    });

    useCase = injector.get(CreateCarUseCase);
    repo = mock;
  });

  it('delegates to CarRepository.create and returns the new car', (done) => {
    const payload: CarCreate = { model: 'BMW', year: 2023 } as any;
    const created = { id: '1', ...payload } as any;
    repo.create.mockReturnValue(of(created));

    useCase.execute(payload).subscribe({
      next: (r) => {
        expect(r).toBe(created);
        expect(repo.create).toHaveBeenCalledWith(payload);
        expect(repo.create).toHaveBeenCalledTimes(1);
        (done as () => void)();
      },
    });
  });

  it('propagates ValidationError on invalid data', (done) => {
    const err = new ValidationError('Invalid car data', { fields: { model: 'required' } });
    repo.create.mockReturnValue(throwError(() => err));

    useCase.execute({} as any).subscribe({
      error: (e) => {
        expect(e).toBe(err);
        (done as () => void)();
      },
    });
  });
});
