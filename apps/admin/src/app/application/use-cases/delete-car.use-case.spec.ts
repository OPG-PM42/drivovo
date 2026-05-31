import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Injector } from '@angular/core';
import { of, throwError } from 'rxjs';
import { DeleteCarUseCase } from './delete-car.use-case';
import { CarService } from '../ports/car.service';
import { NotFoundError } from '../../domain/errors';

describe('DeleteCarUseCase', () => {
  let useCase: DeleteCarUseCase;
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
        { provide: DeleteCarUseCase, useClass: DeleteCarUseCase },
        { provide: CarService, useValue: mock },
      ],
    });

    useCase = injector.get(DeleteCarUseCase);
    svc = mock;
  });

  it('delegates to CarService.delete and completes', (done) => {
    svc.delete.mockReturnValue(of(undefined));

    useCase.execute('99').subscribe({
      next: (r) => {
        expect(r).toBeUndefined();
        expect(svc.delete).toHaveBeenCalledWith('99');
        expect(svc.delete).toHaveBeenCalledTimes(1);
        (done as () => void)();
      },
    });
  });

  it('propagates NotFoundError when car to delete does not exist', (done) => {
    const err = new NotFoundError('car', '99');
    svc.delete.mockReturnValue(throwError(() => err));

    useCase.execute('99').subscribe({
      error: (e) => {
        expect(e).toBe(err);
        (done as () => void)();
      },
    });
  });
});
