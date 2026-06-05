import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Injector } from '@angular/core';
import { of, throwError } from 'rxjs';
import { CarUseCase } from './car.use-case';
import { CarService } from '../ports/car.service';
import { ApiError } from '../../domain/errors';

describe('CarUseCase', () => {
  let useCase: CarUseCase;
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
        { provide: CarUseCase, useClass: CarUseCase },
        { provide: CarService, useValue: mock },
      ],
    });

    useCase = injector.get(CarUseCase);
    svc = mock;
  });

  it('getAll delegates to CarService.getAll with params and returns result', (done) => {
    const params = { page: 1, limit: 10 };
    const result = { items: [{ id: '1' } as any], total: 1 };
    svc.getAll.mockReturnValue(of(result));

    useCase.getAll(params).subscribe({
      next: (r) => {
        expect(r).toBe(result);
        expect(svc.getAll).toHaveBeenCalledWith(params);
        expect(svc.getAll).toHaveBeenCalledTimes(1);
        (done as () => void)();
      },
    });
  });

  it('getById delegates to CarService.getById with id', (done) => {
    const car = { id: '1' } as any;
    svc.getById.mockReturnValue(of(car));

    useCase.getById('1').subscribe({
      next: (r) => {
        expect(r).toBe(car);
        expect(svc.getById).toHaveBeenCalledWith('1');
        expect(svc.getById).toHaveBeenCalledTimes(1);
        (done as () => void)();
      },
    });
  });

  it('create delegates to CarService.create with data', (done) => {
    const data = { name: 'C' } as any;
    const car = { id: '1' } as any;
    svc.create.mockReturnValue(of(car));

    useCase.create(data).subscribe({
      next: (r) => {
        expect(r).toBe(car);
        expect(svc.create).toHaveBeenCalledWith(data);
        expect(svc.create).toHaveBeenCalledTimes(1);
        (done as () => void)();
      },
    });
  });

  it('update delegates to CarService.update with id and data', (done) => {
    const data = { name: 'C' } as any;
    const car = { id: '1' } as any;
    svc.update.mockReturnValue(of(car));

    useCase.update('1', data).subscribe({
      next: (r) => {
        expect(r).toBe(car);
        expect(svc.update).toHaveBeenCalledWith('1', data);
        expect(svc.update).toHaveBeenCalledTimes(1);
        (done as () => void)();
      },
    });
  });

  it('delete delegates to CarService.delete with id', (done) => {
    svc.delete.mockReturnValue(of(undefined));

    useCase.delete('1').subscribe({
      next: () => {
        expect(svc.delete).toHaveBeenCalledWith('1');
        expect(svc.delete).toHaveBeenCalledTimes(1);
        (done as () => void)();
      },
    });
  });

  it('propagates ApiError from service', (done) => {
    const err = new ApiError(500, 'internal error');
    svc.getAll.mockReturnValue(throwError(() => err));

    useCase.getAll().subscribe({
      error: (e) => {
        expect(e).toBe(err);
        (done as () => void)();
      },
    });
  });
});
