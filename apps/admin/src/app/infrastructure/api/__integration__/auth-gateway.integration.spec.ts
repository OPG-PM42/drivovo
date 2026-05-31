import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Injector } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { lastValueFrom, of, throwError } from 'rxjs';
import { errorInterceptor } from '../../http/error.interceptor';
import { AUTH_ME_PATH } from '../../http/auth-paths';
import { UnauthorizedError } from '../../../domain/errors';
import { Configuration, AdminAuthService } from '../generated';
import { HttpAuthGateway } from '../services/http-auth.gateway';
import { AuthGateway } from '../../../application/ports/auth.gateway';

/**
 * Integration spec for AuthGateway.
 * Composes HttpAuthGateway → AdminAuthService → mocked HttpClient and
 * verifies the errorInterceptor wiring on the 401 path
 * (commit 78a48de regression guard).
 */
describe('AuthGateway integration', () => {
  let gateway: AuthGateway;
  let http: jest.Mocked<Pick<HttpClient, 'get' | 'post'>>;

  beforeEach(() => {
    http = { get: jest.fn(), post: jest.fn() } as unknown as jest.Mocked<
      Pick<HttpClient, 'get' | 'post'>
    >;
    const config = new Configuration({ basePath: '', withCredentials: true });
    const injector = Injector.create({
      providers: [
        {
          provide: AdminAuthService,
          useFactory: () => new AdminAuthService(http as unknown as HttpClient, '', config),
        },
        { provide: AuthGateway, useClass: HttpAuthGateway },
      ],
    });
    gateway = injector.get(AuthGateway);
  });

  it('signIn POSTs /auth/sign-in with credentials body + withCredentials flag', async () => {
    (http.post as jest.Mock).mockReturnValue(
      of({
        id: '1',
        email: 'a@b.c',
        name: 'A',
        role: 'admin',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }),
    );

    const admin = await lastValueFrom(gateway.signIn('a@b.c', 'pwd'));

    expect(admin.id).toBe('1');
    expect(admin.email).toBe('a@b.c');
    const [url, body, options] = (http.post as jest.Mock).mock.calls[0] as [
      string,
      Record<string, unknown>,
      { withCredentials?: boolean },
    ];
    expect(url).toBe('/auth/sign-in');
    expect(body).toEqual({ email: 'a@b.c', password: 'pwd' });
    expect(options.withCredentials).toBe(true);
  });

  it('errorInterceptor maps 401 on /auth/sign-in to UnauthorizedError (regression guard for commit 78a48de)', async () => {
    const req = { url: '/auth/sign-in' } as HttpRequest<unknown>;
    const next = () =>
      throwError(
        () =>
          new HttpErrorResponse({
            url: '/auth/sign-in',
            status: 401,
            error: { code: 'UNAUTHORIZED', error: 'invalid credentials' },
          }),
      );
    await expect(
      lastValueFrom(errorInterceptor(req as any, next as any)),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('getCurrentAdmin hits /auth/me; errorInterceptor preserves raw 401 on AUTH_ME_PATH', async () => {
    (http.get as jest.Mock).mockReturnValue(
      of({
        id: '2',
        email: 'b@c.d',
        name: 'B',
        role: 'admin',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }),
    );

    const admin = await lastValueFrom(gateway.getCurrentAdmin());
    expect(admin.email).toBe('b@c.d');
    const [url, options] = (http.get as jest.Mock).mock.calls[0] as [
      string,
      { withCredentials?: boolean },
    ];
    expect(url.endsWith(AUTH_ME_PATH)).toBe(true);
    expect(options.withCredentials).toBe(true);

    // Interceptor exclusion: 401 on AUTH_ME_PATH propagates as raw HttpErrorResponse
    // so auth.guard can decide to redirect instead of triggering forced sign-out.
    const req = { url: `/api${AUTH_ME_PATH}` } as HttpRequest<unknown>;
    const next = () =>
      throwError(
        () =>
          new HttpErrorResponse({
            url: `/api${AUTH_ME_PATH}`,
            status: 401,
            error: { code: 'UNAUTHORIZED', error: 'no session' },
          }),
      );
    await expect(
      lastValueFrom(errorInterceptor(req as any, next as any)),
    ).rejects.toBeInstanceOf(HttpErrorResponse);
  });
});
