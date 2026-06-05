import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Injector } from '@angular/core';
import { of, throwError } from 'rxjs';
import { TariffUseCase } from './tariff.use-case';
import { TariffService } from '../ports/tariff.service';
import { ApiError } from '../../domain/errors';

describe('TariffUseCase', () => {
  let useCase: TariffUseCase;
  let svc: jest.Mocked<TariffService>;

  beforeEach(() => {
    const mock: jest.Mocked<TariffService> = {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<TariffService>;

    const injector = Injector.create({
      providers: [
        { provide: TariffUseCase, useClass: TariffUseCase },
        { provide: TariffService, useValue: mock },
      ],
    });

    useCase = injector.get(TariffUseCase);
    svc = mock;
  });

  it('getAll delegates to TariffService.getAll with params and returns result', (done) => {
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

  it('getById delegates to TariffService.getById with id', (done) => {
    const tariff = { id: '1' } as any;
    svc.getById.mockReturnValue(of(tariff));

    useCase.getById('1').subscribe({
      next: (r) => {
        expect(r).toBe(tariff);
        expect(svc.getById).toHaveBeenCalledWith('1');
        expect(svc.getById).toHaveBeenCalledTimes(1);
        (done as () => void)();
      },
    });
  });

  it('create delegates to TariffService.create with data', (done) => {
    const data = { name: 'T' } as any;
    const tariff = { id: '1' } as any;
    svc.create.mockReturnValue(of(tariff));

    useCase.create(data).subscribe({
      next: (r) => {
        expect(r).toBe(tariff);
        expect(svc.create).toHaveBeenCalledWith(data);
        expect(svc.create).toHaveBeenCalledTimes(1);
        (done as () => void)();
      },
    });
  });

  it('update delegates to TariffService.update with id and data', (done) => {
    const data = { name: 'T' } as any;
    const tariff = { id: '1' } as any;
    svc.update.mockReturnValue(of(tariff));

    useCase.update('1', data).subscribe({
      next: (r) => {
        expect(r).toBe(tariff);
        expect(svc.update).toHaveBeenCalledWith('1', data);
        expect(svc.update).toHaveBeenCalledTimes(1);
        (done as () => void)();
      },
    });
  });

  it('delete delegates to TariffService.delete with id', (done) => {
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
