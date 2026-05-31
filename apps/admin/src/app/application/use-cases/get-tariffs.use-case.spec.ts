import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Injector } from '@angular/core';
import { of, throwError } from 'rxjs';
import { GetTariffsUseCase } from './get-tariffs.use-case';
import { TariffService, TariffListResult } from '../ports/tariff.service';
import { ApiError } from '../../domain/errors';

describe('GetTariffsUseCase', () => {
  let useCase: GetTariffsUseCase;
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
        { provide: GetTariffsUseCase, useClass: GetTariffsUseCase },
        { provide: TariffService, useValue: mock },
      ],
    });

    useCase = injector.get(GetTariffsUseCase);
    svc = mock;
  });

  it('delegates to TariffService.getAll and returns result', (done) => {
    const result: TariffListResult = { items: [], total: 0 };
    svc.getAll.mockReturnValue(of(result));

    useCase.execute({ page: 1, limit: 10 }).subscribe({
      next: (value) => {
        expect(value).toBe(result);
        expect(svc.getAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
        expect(svc.getAll).toHaveBeenCalledTimes(1);
        (done as () => void)();
      },
    });
  });

  it('propagates ApiError from service', (done) => {
    const err = new ApiError(500, 'Internal Server Error');
    svc.getAll.mockReturnValue(throwError(() => err));

    useCase.execute().subscribe({
      error: (caught) => {
        expect(caught).toBe(err);
        (done as () => void)();
      },
    });
  });
});
