import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Injector } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { of, lastValueFrom } from 'rxjs';
import { HttpTariffRepository } from './http-tariff.repository';
import type { TariffEntity, TariffCreate, TariffUpdate } from '../../../domain/tariff';
import type { TariffListResult } from '../../../application/ports/tariff.repository';

const mockTariff: TariffEntity = { id: '99', name: 'Basic Plan' } as TariffEntity;
const mockListResult: TariffListResult = { items: [mockTariff], total: 1 };

function makeRepo(): { repo: HttpTariffRepository; http: jest.Mocked<Pick<HttpClient, 'get' | 'post' | 'patch' | 'delete'>> } {
  const http = {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<Pick<HttpClient, 'get' | 'post' | 'patch' | 'delete'>>;

  const injector = Injector.create({
    providers: [
      { provide: HttpTariffRepository, useClass: HttpTariffRepository },
      { provide: HttpClient, useValue: http },
    ],
  });

  return { repo: injector.get(HttpTariffRepository), http: http as any };
}

describe('HttpTariffRepository', () => {
  let repo: HttpTariffRepository;
  let http: jest.Mocked<Pick<HttpClient, 'get' | 'post' | 'patch' | 'delete'>>;

  beforeEach(() => {
    ({ repo, http } = makeRepo());
  });

  it('getAll: GETs /tariffs with no params and returns list', async () => {
    (http.get as jest.Mock).mockReturnValue(of(mockListResult));
    const result = await lastValueFrom(repo.getAll());
    expect(http.get).toHaveBeenCalledWith('/tariffs', { params: expect.any(HttpParams) });
    expect(result).toEqual(mockListResult);
  });

  it('getAll: passes page, limit, type as HttpParams', async () => {
    (http.get as jest.Mock).mockReturnValue(of(mockListResult));
    await lastValueFrom(repo.getAll({ page: 1, limit: 5, type: 'leasing' }));
    const callArgs = (http.get as jest.Mock).mock.calls[0];
    const params: HttpParams = callArgs[1].params;
    expect(params.get('page')).toBe('1');
    expect(params.get('limit')).toBe('5');
    expect(params.get('type')).toBe('leasing');
  });

  it('getById: GETs /tariffs/:id and returns tariff', async () => {
    (http.get as jest.Mock).mockReturnValue(of(mockTariff));
    const result = await lastValueFrom(repo.getById('99'));
    expect(http.get).toHaveBeenCalledWith('/tariffs/99');
    expect(result).toEqual(mockTariff);
  });

  it('create: POSTs to /tariffs with data and returns created tariff', async () => {
    const data: TariffCreate = { name: 'Basic Plan' } as TariffCreate;
    (http.post as jest.Mock).mockReturnValue(of(mockTariff));
    const result = await lastValueFrom(repo.create(data));
    expect(http.post).toHaveBeenCalledWith('/tariffs', data);
    expect(result).toEqual(mockTariff);
  });

  it('update: PATCHes /tariffs/:id with data and returns updated tariff', async () => {
    const data: TariffUpdate = { name: 'Updated Plan' } as TariffUpdate;
    (http.patch as jest.Mock).mockReturnValue(of(mockTariff));
    const result = await lastValueFrom(repo.update('99', data));
    expect(http.patch).toHaveBeenCalledWith('/tariffs/99', data);
    expect(result).toEqual(mockTariff);
  });

  it('delete: DELETEs /tariffs/:id', async () => {
    (http.delete as jest.Mock).mockReturnValue(of(undefined));
    await lastValueFrom(repo.delete('99'));
    expect(http.delete).toHaveBeenCalledWith('/tariffs/99');
  });
});
