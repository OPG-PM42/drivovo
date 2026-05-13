import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Injector } from '@angular/core';
import { of, throwError } from 'rxjs';
import { GetTariffByIdUseCase } from './get-tariff-by-id.use-case';
import { TariffRepository } from '../ports/tariff.repository';
import { TariffEntity } from '../../domain/tariff';
import { NotFoundError } from '../../domain/errors';

describe('GetTariffByIdUseCase', () => {
  let useCase: GetTariffByIdUseCase;
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
        { provide: GetTariffByIdUseCase, useClass: GetTariffByIdUseCase },
        { provide: TariffRepository, useValue: mock },
      ],
    });

    useCase = injector.get(GetTariffByIdUseCase);
    repo = mock;
  });

  it('delegates to TariffRepository.getById and returns tariff entity', (done) => {
    const tariff = { id: '42' } as TariffEntity;
    repo.getById.mockReturnValue(of(tariff));

    useCase.execute('42').subscribe({
      next: (value) => {
        expect(value).toBe(tariff);
        expect(repo.getById).toHaveBeenCalledWith('42');
        expect(repo.getById).toHaveBeenCalledTimes(1);
        (done as () => void)();
      },
    });
  });

  it('propagates NotFoundError when tariff does not exist', (done) => {
    const err = new NotFoundError('tariff', '99');
    repo.getById.mockReturnValue(throwError(() => err));

    useCase.execute('99').subscribe({
      error: (caught) => {
        expect(caught).toBe(err);
        (done as () => void)();
      },
    });
  });
});
