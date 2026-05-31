import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Injector } from '@angular/core';
import { of, throwError } from 'rxjs';
import { CreateTariffUseCase } from './create-tariff.use-case';
import { TariffService } from '../ports/tariff.service';
import { TariffEntity, TariffCreate } from '../../domain/tariff';
import { ValidationError } from '../../domain/errors';

describe('CreateTariffUseCase', () => {
  let useCase: CreateTariffUseCase;
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
        { provide: CreateTariffUseCase, useClass: CreateTariffUseCase },
        { provide: TariffService, useValue: mock },
      ],
    });

    useCase = injector.get(CreateTariffUseCase);
    svc = mock;
  });

  it('delegates to TariffService.create and returns created entity', (done) => {
    const payload = { name: 'Basic' } as TariffCreate;
    const created = { id: '1', name: 'Basic' } as TariffEntity;
    svc.create.mockReturnValue(of(created));

    useCase.execute(payload).subscribe({
      next: (value) => {
        expect(value).toBe(created);
        expect(svc.create).toHaveBeenCalledWith(payload);
        expect(svc.create).toHaveBeenCalledTimes(1);
        (done as () => void)();
      },
    });
  });

  it('propagates ValidationError on 422 response', (done) => {
    const err = new ValidationError('name is required', { field: 'name' });
    svc.create.mockReturnValue(throwError(() => err));

    useCase.execute({ name: '' } as TariffCreate).subscribe({
      error: (caught) => {
        expect(caught).toBe(err);
        (done as () => void)();
      },
    });
  });
});
