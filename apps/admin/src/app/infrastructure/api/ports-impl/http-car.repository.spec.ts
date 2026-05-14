import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Injector } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { of, lastValueFrom } from 'rxjs';
import { HttpCarRepository } from './http-car.repository';
import type { CarEntity, CarCreate, CarUpdate } from '../../../domain/car';
import type { CarListResult } from '../../../application/ports/car.repository';

const mockCar: CarEntity = { id: '42', name: 'Tesla Model 3' } as CarEntity;
const mockListResult: CarListResult = { items: [mockCar], total: 1 };

function makeRepo(): { repo: HttpCarRepository; http: jest.Mocked<Pick<HttpClient, 'get' | 'post' | 'patch' | 'delete'>> } {
  const http = {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<Pick<HttpClient, 'get' | 'post' | 'patch' | 'delete'>>;

  const injector = Injector.create({
    providers: [
      { provide: HttpCarRepository, useClass: HttpCarRepository },
      { provide: HttpClient, useValue: http },
    ],
  });

  return { repo: injector.get(HttpCarRepository), http: http as any };
}

describe('HttpCarRepository', () => {
  let repo: HttpCarRepository;
  let http: jest.Mocked<Pick<HttpClient, 'get' | 'post' | 'patch' | 'delete'>>;

  beforeEach(() => {
    ({ repo, http } = makeRepo());
  });

  it('getAll: GETs /cars with no params and returns list', async () => {
    (http.get as jest.Mock).mockReturnValue(of(mockListResult));
    const result = await lastValueFrom(repo.getAll());
    expect(http.get).toHaveBeenCalledWith('/cars', { params: expect.any(HttpParams) });
    expect(result).toEqual(mockListResult);
  });

  it('getAll: passes page, limit, sort, order as HttpParams', async () => {
    (http.get as jest.Mock).mockReturnValue(of(mockListResult));
    await lastValueFrom(repo.getAll({ page: 2, limit: 10, sort: 'name', order: 'asc' }));
    const callArgs = (http.get as jest.Mock).mock.calls[0];
    const params: HttpParams = callArgs[1].params;
    expect(params.get('page')).toBe('2');
    expect(params.get('limit')).toBe('10');
    expect(params.get('sort')).toBe('name');
    expect(params.get('order')).toBe('asc');
  });

  it('getById: GETs /cars/:id and returns car', async () => {
    (http.get as jest.Mock).mockReturnValue(of(mockCar));
    const result = await lastValueFrom(repo.getById('42'));
    expect(http.get).toHaveBeenCalledWith('/cars/42');
    expect(result).toEqual(mockCar);
  });

  it('create: POSTs to /cars with data and returns created car', async () => {
    const data: CarCreate = { name: 'Tesla Model 3' } as CarCreate;
    (http.post as jest.Mock).mockReturnValue(of(mockCar));
    const result = await lastValueFrom(repo.create(data));
    expect(http.post).toHaveBeenCalledWith('/cars', data);
    expect(result).toEqual(mockCar);
  });

  it('update: PATCHes /cars/:id with data and returns updated car', async () => {
    const data: CarUpdate = { name: 'Updated' } as CarUpdate;
    (http.patch as jest.Mock).mockReturnValue(of(mockCar));
    const result = await lastValueFrom(repo.update('42', data));
    expect(http.patch).toHaveBeenCalledWith('/cars/42', data);
    expect(result).toEqual(mockCar);
  });

  it('delete: DELETEs /cars/:id', async () => {
    (http.delete as jest.Mock).mockReturnValue(of(undefined));
    await lastValueFrom(repo.delete('42'));
    expect(http.delete).toHaveBeenCalledWith('/cars/42');
  });
});
