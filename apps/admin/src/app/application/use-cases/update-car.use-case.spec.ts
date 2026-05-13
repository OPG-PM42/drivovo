import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Injector } from '@angular/core';
import { of, throwError } from 'rxjs';
import { UpdateCarUseCase } from './update-car.use-case';
import { CarRepository } from '../ports/car.repository';
import { ValidationError } from '../../domain/errors';
import { CarUpdate } from '../../domain/car';

describe('UpdateCarUseCase', () => {
  let useCase: UpdateCarUseCase;
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
        { provide: UpdateCarUseCase, useClass: UpdateCarUseCase },
        { provide: CarRepository, useValue: mock },
      ],
    });

    useCase = injector.get(UpdateCarUseCase);
    repo = mock;
  });

  it('delegates to CarRepository.update and returns updated car', (done) => {
    const payload: CarUpdate = { model: 'BMW X5' } as any;
    const updated = { id: '1', ...payload } as any;
    repo.update.mockReturnValue(of(updated));

    useCase.execute('1', payload).subscribe({
      next: (r) => {
        expect(r).toBe(updated);
        expect(repo.update).toHaveBeenCalledWith('1', payload);
        expect(repo.update).toHaveBeenCalledTimes(1);
        (done as () => void)();
      },
    });
  });

  it('propagates ValidationError on invalid update data', (done) => {
    const err = new ValidationError('Invalid update', { fields: { year: 'must be number' } });
    repo.update.mockReturnValue(throwError(() => err));

    useCase.execute('1', {} as any).subscribe({
      error: (e) => {
        expect(e).toBe(err);
        (done as () => void)();
      },
    });
  });
});
