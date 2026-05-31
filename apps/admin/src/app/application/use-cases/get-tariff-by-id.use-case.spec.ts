import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Injector } from '@angular/core';
import { of, throwError } from 'rxjs';
import { GetTariffByIdUseCase } from './get-tariff-by-id.use-case';
import { TariffService } from '../ports/tariff.service';
import { TariffEntity } from '../../domain/tariff';
import { NotFoundError } from '../../domain/errors';

describe('GetTariffByIdUseCase', () => {
  let useCase: GetTariffByIdUseCase;
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
        { provide: GetTariffByIdUseCase, useClass: GetTariffByIdUseCase },
        { provide: TariffService, useValue: mock },
      ],
    });

    useCase = injector.get(GetTariffByIdUseCase);
    svc = mock;
  });

  it('delegates to TariffService.getById and returns tariff entity', (done) => {
    const tariff = { id: '42' } as TariffEntity;
    svc.getById.mockReturnValue(of(tariff));

    useCase.execute('42').subscribe({
      next: (value) => {
        expect(value).toBe(tariff);
        expect(svc.getById).toHaveBeenCalledWith('42');
        expect(svc.getById).toHaveBeenCalledTimes(1);
        (done as () => void)();
      },
    });
  });

  it('propagates NotFoundError when tariff does not exist', (done) => {
    const err = new NotFoundError('tariff', '99');
    svc.getById.mockReturnValue(throwError(() => err));

    useCase.execute('99').subscribe({
      error: (caught) => {
        expect(caught).toBe(err);
        (done as () => void)();
      },
    });
  });
});
