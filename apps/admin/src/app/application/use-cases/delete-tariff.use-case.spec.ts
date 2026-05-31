import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Injector } from '@angular/core';
import { of, throwError } from 'rxjs';
import { DeleteTariffUseCase } from './delete-tariff.use-case';
import { TariffService } from '../ports/tariff.service';
import { NotFoundError } from '../../domain/errors';

describe('DeleteTariffUseCase', () => {
  let useCase: DeleteTariffUseCase;
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
        { provide: DeleteTariffUseCase, useClass: DeleteTariffUseCase },
        { provide: TariffService, useValue: mock },
      ],
    });

    useCase = injector.get(DeleteTariffUseCase);
    svc = mock;
  });

  it('delegates to TariffService.delete and completes', (done) => {
    svc.delete.mockReturnValue(of(undefined));

    useCase.execute('7').subscribe({
      complete: () => {
        expect(svc.delete).toHaveBeenCalledWith('7');
        expect(svc.delete).toHaveBeenCalledTimes(1);
        (done as () => void)();
      },
    });
  });

  it('propagates NotFoundError when tariff does not exist', (done) => {
    const err = new NotFoundError('tariff', '99');
    svc.delete.mockReturnValue(throwError(() => err));

    useCase.execute('99').subscribe({
      error: (caught) => {
        expect(caught).toBe(err);
        (done as () => void)();
      },
    });
  });
});
