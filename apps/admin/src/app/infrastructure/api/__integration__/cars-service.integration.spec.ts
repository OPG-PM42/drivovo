import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Injector } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { lastValueFrom, of, throwError } from 'rxjs';
import { errorInterceptor } from '../../http/error.interceptor';
import { NotFoundError } from '../../../domain/errors';
import { Configuration, AdminCarsService } from '../generated';
import { HttpCarService } from '../services/http-car.service';
import { CarService } from '../../../application/ports/car.service';

/**
 * Integration spec for CarService.
 * Composes HttpCarService → AdminCarsService → mocked HttpClient,
 * verifying URL, query params, withCredentials, and 404 → NotFoundError mapping
 * via the errorInterceptor chain.
 */
describe('CarService integration', () => {
  let svc: CarService;
  let http: jest.Mocked<Pick<HttpClient, 'get' | 'post' | 'patch' | 'delete'>>;

  beforeEach(() => {
    http = {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<Pick<HttpClient, 'get' | 'post' | 'patch' | 'delete'>>;
    const config = new Configuration({ basePath: '', withCredentials: true });
    const injector = Injector.create({
      providers: [
        {
          provide: AdminCarsService,
          useFactory: () => new AdminCarsService(http as unknown as HttpClient, '', config),
        },
        { provide: CarService, useClass: HttpCarService },
      ],
    });
    svc = injector.get(CarService);
  });

  it('getAll: GETs /cars with limit + offset query params and withCredentials=true', async () => {
    (http.get as jest.Mock).mockReturnValue(of({ items: [], total: 0 }));
    await lastValueFrom(svc.getAll({ page: 2, limit: 10 }));
    const [url, options] = (http.get as jest.Mock).mock.calls[0] as [
      string,
      { params: { get: (k: string) => string | null }; withCredentials?: boolean },
    ];
    expect(url).toBe('/cars');
    expect(options.params.get('limit')).toBe('10');
    expect(options.params.get('offset')).toBe('10');
    expect(options.withCredentials).toBe(true);
  });

  it('getById: GETs /cars/:id and maps response to domain CarEntity shape', async () => {
    (http.get as jest.Mock).mockReturnValue(
      of({
        id: 'xyz',
        name: 'Tesla Model 3',
        brand: 'Tesla',
        description: '',
        driveType: 'AWD',
        type: 'sedan',
        status: 'available',
        images: [],
        engine: { type: 'electric', capacity: '0', fuel_consumption: '0' },
        interiorTrim: '',
        acceleration: '',
        power: '',
        color: '',
        url: '',
      }),
    );
    const car = await lastValueFrom(svc.getById('xyz'));
    expect(car.id).toBe('xyz');
    expect(car.engine.type).toBe('electric');
    const [url, options] = (http.get as jest.Mock).mock.calls[0] as [
      string,
      { withCredentials?: boolean },
    ];
    expect(url).toBe('/cars/xyz');
    expect(options.withCredentials).toBe(true);
  });

  it('errorInterceptor maps 404 on /cars/:id to NotFoundError', async () => {
    const req = { url: '/cars/missing' } as HttpRequest<unknown>;
    const next = () =>
      throwError(
        () =>
          new HttpErrorResponse({
            url: '/cars/missing',
            status: 404,
            error: { code: 'NOT_FOUND', error: 'no such car' },
          }),
      );
    await expect(
      lastValueFrom(errorInterceptor(req as any, next as any)),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
