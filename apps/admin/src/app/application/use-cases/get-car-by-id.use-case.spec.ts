import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Injector } from '@angular/core';
import { of, throwError } from 'rxjs';
import { GetCarByIdUseCase } from './get-car-by-id.use-case';
import { CarService } from '../ports/car.service';
import { NotFoundError } from '../../domain/errors';

describe('GetCarByIdUseCase', () => {
  let useCase: GetCarByIdUseCase;
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
        { provide: GetCarByIdUseCase, useClass: GetCarByIdUseCase },
        { provide: CarService, useValue: mock },
      ],
    });

    useCase = injector.get(GetCarByIdUseCase);
    svc = mock;
  });

  it('delegates to CarService.getById and returns the car', (done) => {
    const car = { id: '42', model: 'Tesla' } as any;
    svc.getById.mockReturnValue(of(car));

    useCase.execute('42').subscribe({
      next: (r) => {
        expect(r).toBe(car);
        expect(svc.getById).toHaveBeenCalledWith('42');
        expect(svc.getById).toHaveBeenCalledTimes(1);
        (done as () => void)();
      },
    });
  });

  it('propagates NotFoundError when car does not exist', (done) => {
    const err = new NotFoundError('car', '42');
    svc.getById.mockReturnValue(throwError(() => err));

    useCase.execute('42').subscribe({
      error: (e) => {
        expect(e).toBe(err);
        (done as () => void)();
      },
    });
  });
});
