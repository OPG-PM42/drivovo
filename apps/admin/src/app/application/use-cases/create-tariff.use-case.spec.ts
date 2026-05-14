import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Injector } from '@angular/core';
import { of, throwError } from 'rxjs';
import { CreateTariffUseCase } from './create-tariff.use-case';
import { TariffRepository } from '../ports/tariff.repository';
import { TariffEntity, TariffCreate } from '../../domain/tariff';
import { ValidationError } from '../../domain/errors';

describe('CreateTariffUseCase', () => {
  let useCase: CreateTariffUseCase;
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
        { provide: CreateTariffUseCase, useClass: CreateTariffUseCase },
        { provide: TariffRepository, useValue: mock },
      ],
    });

    useCase = injector.get(CreateTariffUseCase);
    repo = mock;
  });

  it('delegates to TariffRepository.create and returns created entity', (done) => {
    const payload = { name: 'Basic' } as TariffCreate;
    const created = { id: '1', name: 'Basic' } as TariffEntity;
    repo.create.mockReturnValue(of(created));

    useCase.execute(payload).subscribe({
      next: (value) => {
        expect(value).toBe(created);
        expect(repo.create).toHaveBeenCalledWith(payload);
        expect(repo.create).toHaveBeenCalledTimes(1);
        (done as () => void)();
      },
    });
  });

  it('propagates ValidationError on 422 response', (done) => {
    const err = new ValidationError('name is required', { field: 'name' });
    repo.create.mockReturnValue(throwError(() => err));

    useCase.execute({ name: '' } as TariffCreate).subscribe({
      error: (caught) => {
        expect(caught).toBe(err);
        (done as () => void)();
      },
    });
  });
});
