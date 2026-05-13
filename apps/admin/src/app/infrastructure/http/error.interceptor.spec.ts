import { describe, it, expect } from '@jest/globals';
import { HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { lastValueFrom, throwError } from 'rxjs';
import { errorInterceptor } from './error.interceptor';
import { AUTH_ME_PATH } from './auth-paths';
import { ApiError, NotFoundError, UnauthorizedError, ValidationError } from '../../domain/errors';

function callInterceptor(url: string, status: number, body?: unknown): Promise<unknown> {
  const req = { url } as HttpRequest<unknown>;
  const next = () => throwError(() => new HttpErrorResponse({ url, status, error: body }));
  return lastValueFrom(errorInterceptor(req as any, next as any));
}

describe('errorInterceptor mapping', () => {
  it('passes through 401 on AUTH_ME_PATH as raw HttpErrorResponse', async () => {
    await expect(callInterceptor(`/api${AUTH_ME_PATH}`, 401)).rejects.toBeInstanceOf(HttpErrorResponse);
  });

  it('maps 401 elsewhere to UnauthorizedError', async () => {
    await expect(callInterceptor('/cars', 401)).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('maps 404 to NotFoundError with parsed resource and id', async () => {
    await expect(callInterceptor('/cars/123', 404)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('maps 422 to ValidationError with body details', async () => {
    await expect(
      callInterceptor('/cars', 422, { errors: { name: 'required' }, message: 'invalid' }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('maps 500 to ApiError', async () => {
    await expect(callInterceptor('/cars', 500)).rejects.toBeInstanceOf(ApiError);
  });

  it('maps network error (status 0) to ApiError', async () => {
    await expect(callInterceptor('/cars', 0)).rejects.toBeInstanceOf(ApiError);
  });
});
