import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Injector } from '@angular/core';
import { of, throwError } from 'rxjs';
import { GetTariffsUseCase } from './get-tariffs.use-case';
import { TariffRepository, TariffListResult } from '../ports/tariff.repository';
import { ApiError } from '../../domain/errors';

describe('GetTariffsUseCase', () => {
  let useCase: GetTariffsUseCase;
  let repo: jest.Mocked<TariffRepository>;

  beforeEach(() => {
    const mock: jest.Mocked<TariffRepository> = {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<TariffRepository>;

    const injector = Injector.create({
      providers: [
        { provide: GetTariffsUseCase, useClass: GetTariffsUseCase },
        { provide: TariffRepository, useValue: mock },
      ],
    });

    useCase = injector.get(GetTariffsUseCase);
    repo = mock;
  });

  it('delegates to TariffRepository.getAll and returns result', (done) => {
    const result: TariffListResult = { items: [], total: 0 };
    repo.getAll.mockReturnValue(of(result));

    useCase.execute({ page: 1, limit: 10 }).subscribe({
      next: (value) => {
        expect(value).toBe(result);
        expect(repo.getAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
        expect(repo.getAll).toHaveBeenCalledTimes(1);
        (done as () => void)();
      },
    });
  });

  it('propagates ApiError from repository', (done) => {
    const err = new ApiError(500, 'Internal Server Error');
    repo.getAll.mockReturnValue(throwError(() => err));

    useCase.execute().subscribe({
      error: (caught) => {
        expect(caught).toBe(err);
        (done as () => void)();
      },
    });
  });
});
