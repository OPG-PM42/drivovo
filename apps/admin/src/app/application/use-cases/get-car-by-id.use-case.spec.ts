import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Injector } from '@angular/core';
import { of, throwError } from 'rxjs';
import { GetCarByIdUseCase } from './get-car-by-id.use-case';
import { CarRepository } from '../ports/car.repository';
import { NotFoundError } from '../../domain/errors';

describe('GetCarByIdUseCase', () => {
  let useCase: GetCarByIdUseCase;
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
        { provide: GetCarByIdUseCase, useClass: GetCarByIdUseCase },
        { provide: CarRepository, useValue: mock },
      ],
    });

    useCase = injector.get(GetCarByIdUseCase);
    repo = mock;
  });

  it('delegates to CarRepository.getById and returns the car', (done) => {
    const car = { id: '42', model: 'Tesla' } as any;
    repo.getById.mockReturnValue(of(car));

    useCase.execute('42').subscribe({
      next: (r) => {
        expect(r).toBe(car);
        expect(repo.getById).toHaveBeenCalledWith('42');
        expect(repo.getById).toHaveBeenCalledTimes(1);
        (done as () => void)();
      },
    });
  });

  it('propagates NotFoundError when car does not exist', (done) => {
    const err = new NotFoundError('car', '42');
    repo.getById.mockReturnValue(throwError(() => err));

    useCase.execute('42').subscribe({
      error: (e) => {
        expect(e).toBe(err);
        (done as () => void)();
      },
    });
  });
});
