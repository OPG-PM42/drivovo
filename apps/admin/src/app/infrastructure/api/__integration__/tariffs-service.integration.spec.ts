import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, of } from 'rxjs';
import { Configuration, AdminTariffsService } from '../generated';
import { HttpTariffService } from '../services/http-tariff.service';
import { TariffService } from '../../../application/ports/tariff.service';

/**
 * Integration spec for TariffService.
 * Composes HttpTariffService → AdminTariffsService → mocked HttpClient,
 * verifying URL, query params (including the leasing/subscription enum),
 * withCredentials, and DTO → domain mapping.
 */
describe('TariffService integration', () => {
  let svc: TariffService;
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
          provide: AdminTariffsService,
          useFactory: () => new AdminTariffsService(http as unknown as HttpClient, '', config),
        },
        { provide: TariffService, useClass: HttpTariffService },
      ],
    });
    svc = injector.get(TariffService);
  });

  it('getAll: GETs /tariffs with type=leasing query param and withCredentials=true', async () => {
    (http.get as jest.Mock).mockReturnValue(
      of({
        items: [{ id: 't1', name: 'Basic', type: 'leasing', options: [] }],
        total: 1,
      }),
    );
    const res = await lastValueFrom(svc.getAll({ type: 'leasing' }));
    expect(res.total).toBe(1);
    const [url, options] = (http.get as jest.Mock).mock.calls[0] as [
      string,
      { params: { get: (k: string) => string | null }; withCredentials?: boolean },
    ];
    expect(url).toBe('/tariffs');
    expect(options.params.get('type')).toBe('leasing');
    expect(options.withCredentials).toBe(true);
  });

  it('getById: GETs /tariffs/:id and maps response to domain TariffEntity shape', async () => {
    (http.get as jest.Mock).mockReturnValue(
      of({ id: 't-99', name: 'Premium', type: 'subscription', options: [] }),
    );
    const tariff = await lastValueFrom(svc.getById('t-99'));
    expect(tariff.id).toBe('t-99');
    expect(tariff.type).toBe('subscription');
    const [url, options] = (http.get as jest.Mock).mock.calls[0] as [
      string,
      { withCredentials?: boolean },
    ];
    expect(url).toBe('/tariffs/t-99');
    expect(options.withCredentials).toBe(true);
  });
});
