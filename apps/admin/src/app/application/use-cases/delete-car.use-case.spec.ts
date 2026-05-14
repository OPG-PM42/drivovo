import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Injector } from '@angular/core';
import { of, throwError } from 'rxjs';
import { DeleteCarUseCase } from './delete-car.use-case';
import { CarRepository } from '../ports/car.repository';
import { NotFoundError } from '../../domain/errors';

describe('DeleteCarUseCase', () => {
  let useCase: DeleteCarUseCase;
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
        { provide: DeleteCarUseCase, useClass: DeleteCarUseCase },
        { provide: CarRepository, useValue: mock },
      ],
    });

    useCase = injector.get(DeleteCarUseCase);
    repo = mock;
  });

  it('delegates to CarRepository.delete and completes', (done) => {
    repo.delete.mockReturnValue(of(undefined));

    useCase.execute('99').subscribe({
      next: (r) => {
        expect(r).toBeUndefined();
        expect(repo.delete).toHaveBeenCalledWith('99');
        expect(repo.delete).toHaveBeenCalledTimes(1);
        (done as () => void)();
      },
    });
  });

  it('propagates NotFoundError when car to delete does not exist', (done) => {
    const err = new NotFoundError('car', '99');
    repo.delete.mockReturnValue(throwError(() => err));

    useCase.execute('99').subscribe({
      error: (e) => {
        expect(e).toBe(err);
        (done as () => void)();
      },
    });
  });
});
