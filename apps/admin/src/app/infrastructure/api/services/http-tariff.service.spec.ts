import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Injector } from '@angular/core';
import { of, lastValueFrom } from 'rxjs';
import { HttpTariffService } from './http-tariff.service';
import { AdminTariffsService } from '../generated';
import type { Tariff as GeneratedTariff, TariffListResult as GeneratedTariffListResult } from '../generated';

const mockGeneratedTariff: GeneratedTariff = {
  id: '99',
  name: 'Basic Plan',
  type: 'leasing',
  options: [],
};

const mockListResult: GeneratedTariffListResult = { items: [mockGeneratedTariff], total: 1 };

function makeService(): {
  svc: HttpTariffService;
  api: jest.Mocked<Pick<AdminTariffsService, 'getTariffs' | 'getTariffById' | 'createTariff' | 'updateTariff' | 'deleteTariff'>>;
} {
  const api = {
    getTariffs: jest.fn(),
    getTariffById: jest.fn(),
    createTariff: jest.fn(),
    updateTariff: jest.fn(),
    deleteTariff: jest.fn(),
  } as unknown as jest.Mocked<Pick<AdminTariffsService, 'getTariffs' | 'getTariffById' | 'createTariff' | 'updateTariff' | 'deleteTariff'>>;

  const injector = Injector.create({
    providers: [
      { provide: HttpTariffService, useClass: HttpTariffService },
      { provide: AdminTariffsService, useValue: api },
    ],
  });

  return { svc: injector.get(HttpTariffService), api: api as any };
}

describe('HttpTariffService', () => {
  let svc: HttpTariffService;
  let api: jest.Mocked<Pick<AdminTariffsService, 'getTariffs' | 'getTariffById' | 'createTariff' | 'updateTariff' | 'deleteTariff'>>;

  beforeEach(() => {
    ({ svc, api } = makeService());
  });

  it('getAll: calls AdminTariffsService.getTariffs and maps items via mapper', async () => {
    (api.getTariffs as jest.Mock).mockReturnValue(of(mockListResult));
    const result = await lastValueFrom(svc.getAll());
    expect(api.getTariffs).toHaveBeenCalledTimes(1);
    expect(result.total).toBe(1);
    expect(result.items[0].id).toBe('99');
  });

  it('getAll: passes page/limit/type to AdminTariffsService.getTariffs', async () => {
    (api.getTariffs as jest.Mock).mockReturnValue(of({ items: [], total: 0 }));
    await lastValueFrom(svc.getAll({ page: 1, limit: 5, type: 'leasing' }));
    expect(api.getTariffs).toHaveBeenCalledWith('5', '0', undefined, undefined, 'leasing');
  });

  it('getById: delegates and maps DTO → entity', async () => {
    (api.getTariffById as jest.Mock).mockReturnValue(of(mockGeneratedTariff));
    const result = await lastValueFrom(svc.getById('99'));
    expect(api.getTariffById).toHaveBeenCalledWith('99');
    expect(result.id).toBe('99');
  });

  it('create: forwards and returns entity with id', async () => {
    (api.createTariff as jest.Mock).mockReturnValue(of({ id: 't-1' }));
    const result = await lastValueFrom(svc.create({ name: 'Basic', type: 'leasing' } as any));
    expect(api.createTariff).toHaveBeenCalledTimes(1);
    expect(result.id).toBe('t-1');
  });

  it('update: forwards and returns entity', async () => {
    (api.updateTariff as jest.Mock).mockReturnValue(of({ success: true }));
    const result = await lastValueFrom(svc.update('99', { name: 'Updated' } as any));
    expect(api.updateTariff).toHaveBeenCalledTimes(1);
    expect(result.id).toBe('99');
  });

  it('delete: forwards and maps to void', async () => {
    (api.deleteTariff as jest.Mock).mockReturnValue(of({ success: true }));
    const result = await lastValueFrom(svc.delete('99'));
    expect(api.deleteTariff).toHaveBeenCalledWith('99');
    expect(result).toBeUndefined();
  });
});
