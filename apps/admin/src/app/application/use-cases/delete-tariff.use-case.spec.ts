import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Injector } from '@angular/core';
import { of, throwError } from 'rxjs';
import { DeleteTariffUseCase } from './delete-tariff.use-case';
import { TariffRepository } from '../ports/tariff.repository';
import { NotFoundError } from '../../domain/errors';

describe('DeleteTariffUseCase', () => {
  let useCase: DeleteTariffUseCase;
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
        { provide: DeleteTariffUseCase, useClass: DeleteTariffUseCase },
        { provide: TariffRepository, useValue: mock },
      ],
    });

    useCase = injector.get(DeleteTariffUseCase);
    repo = mock;
  });

  it('delegates to TariffRepository.delete and completes', (done) => {
    repo.delete.mockReturnValue(of(undefined));

    useCase.execute('7').subscribe({
      complete: () => {
        expect(repo.delete).toHaveBeenCalledWith('7');
        expect(repo.delete).toHaveBeenCalledTimes(1);
        (done as () => void)();
      },
    });
  });

  it('propagates NotFoundError when tariff does not exist', (done) => {
    const err = new NotFoundError('tariff', '99');
    repo.delete.mockReturnValue(throwError(() => err));

    useCase.execute('99').subscribe({
      error: (caught) => {
        expect(caught).toBe(err);
        (done as () => void)();
      },
    });
  });
});
