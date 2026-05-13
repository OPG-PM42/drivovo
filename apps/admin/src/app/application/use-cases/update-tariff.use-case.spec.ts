import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Injector } from '@angular/core';
import { of, throwError } from 'rxjs';
import { UpdateTariffUseCase } from './update-tariff.use-case';
import { TariffRepository } from '../ports/tariff.repository';
import { TariffEntity, TariffUpdate } from '../../domain/tariff';
import { ValidationError } from '../../domain/errors';

describe('UpdateTariffUseCase', () => {
  let useCase: UpdateTariffUseCase;
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
        { provide: UpdateTariffUseCase, useClass: UpdateTariffUseCase },
        { provide: TariffRepository, useValue: mock },
      ],
    });

    useCase = injector.get(UpdateTariffUseCase);
    repo = mock;
  });

  it('delegates to TariffRepository.update and returns updated entity', (done) => {
    const payload = { name: 'Premium' } as TariffUpdate;
    const updated = { id: '5', name: 'Premium' } as TariffEntity;
    repo.update.mockReturnValue(of(updated));

    useCase.execute('5', payload).subscribe({
      next: (value) => {
        expect(value).toBe(updated);
        expect(repo.update).toHaveBeenCalledWith('5', payload);
        expect(repo.update).toHaveBeenCalledTimes(1);
        (done as () => void)();
      },
    });
  });

  it('propagates ValidationError on 422 response', (done) => {
    const err = new ValidationError('price must be positive', { field: 'price' });
    repo.update.mockReturnValue(throwError(() => err));

    useCase.execute('5', { price: -1 } as TariffUpdate).subscribe({
      error: (caught) => {
        expect(caught).toBe(err);
        (done as () => void)();
      },
    });
  });
});
