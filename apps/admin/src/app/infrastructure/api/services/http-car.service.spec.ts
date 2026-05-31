import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Injector } from '@angular/core';
import { of, lastValueFrom } from 'rxjs';
import { HttpCarService } from './http-car.service';
import { AdminCarsService } from '../generated';
import type { Car as GeneratedCar, CarListResult as GeneratedCarListResult } from '../generated';

const mockGeneratedCar: GeneratedCar = {
  id: '42',
  name: 'Tesla Model 3',
  brand: 'Tesla',
  description: 'EV sedan',
  driveType: 'AWD',
  type: 'sedan',
  status: 'available',
  images: [],
  engine: { type: 'electric', capacity: '0', fuel_consumption: '0' },
  interiorTrim: 'Black',
  acceleration: '3.1',
  power: '450',
  color: 'White',
  url: 'tesla-model-3',
};

const mockListResult: GeneratedCarListResult = { items: [mockGeneratedCar], total: 1 };

function makeService(): {
  svc: HttpCarService;
  api: jest.Mocked<Pick<AdminCarsService, 'getCars' | 'getCarById' | 'createCar' | 'updateCar' | 'deleteCar'>>;
} {
  const api = {
    getCars: jest.fn(),
    getCarById: jest.fn(),
    createCar: jest.fn(),
    updateCar: jest.fn(),
    deleteCar: jest.fn(),
  } as unknown as jest.Mocked<Pick<AdminCarsService, 'getCars' | 'getCarById' | 'createCar' | 'updateCar' | 'deleteCar'>>;

  const injector = Injector.create({
    providers: [
      { provide: HttpCarService, useClass: HttpCarService },
      { provide: AdminCarsService, useValue: api },
    ],
  });

  return { svc: injector.get(HttpCarService), api: api as any };
}

describe('HttpCarService', () => {
  let svc: HttpCarService;
  let api: jest.Mocked<Pick<AdminCarsService, 'getCars' | 'getCarById' | 'createCar' | 'updateCar' | 'deleteCar'>>;

  beforeEach(() => {
    ({ svc, api } = makeService());
  });

  it('getAll: calls AdminCarsService.getCars and maps items via mapper', async () => {
    (api.getCars as jest.Mock).mockReturnValue(of(mockListResult));
    const result = await lastValueFrom(svc.getAll());
    expect(api.getCars).toHaveBeenCalledTimes(1);
    expect(result.total).toBe(1);
    expect(result.items[0].id).toBe('42');
    expect(result.items[0].engine.type).toBe('electric');
  });

  it('getAll: passes limit + computed offset to AdminCarsService.getCars', async () => {
    (api.getCars as jest.Mock).mockReturnValue(of({ items: [], total: 0 }));
    await lastValueFrom(svc.getAll({ page: 2, limit: 10, sort: 'name', order: 'asc' }));
    expect(api.getCars).toHaveBeenCalledWith('10', '10', 'name', 'asc');
  });

  it('getById: delegates and maps DTO → entity', async () => {
    (api.getCarById as jest.Mock).mockReturnValue(of(mockGeneratedCar));
    const result = await lastValueFrom(svc.getById('42'));
    expect(api.getCarById).toHaveBeenCalledWith('42');
    expect(result.id).toBe('42');
  });

  it('create: forwards to AdminCarsService.createCar and returns entity with id', async () => {
    (api.createCar as jest.Mock).mockReturnValue(of({ id: 'new-1' }));
    const result = await lastValueFrom(svc.create({ name: 'BMW' } as any));
    expect(api.createCar).toHaveBeenCalledTimes(1);
    expect(result.id).toBe('new-1');
  });

  it('update: forwards to AdminCarsService.updateCar', async () => {
    (api.updateCar as jest.Mock).mockReturnValue(of({ success: true }));
    const result = await lastValueFrom(svc.update('42', { name: 'Updated' } as any));
    expect(api.updateCar).toHaveBeenCalledTimes(1);
    expect(result.id).toBe('42');
  });

  it('delete: forwards to AdminCarsService.deleteCar and maps to void', async () => {
    (api.deleteCar as jest.Mock).mockReturnValue(of({ success: true }));
    const result = await lastValueFrom(svc.delete('42'));
    expect(api.deleteCar).toHaveBeenCalledWith('42');
    expect(result).toBeUndefined();
  });
});
