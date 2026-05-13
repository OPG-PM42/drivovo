import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ApiError, NotFoundError, UnauthorizedError, ValidationError } from '../../domain/errors';
import { AUTH_ME_PATH } from './auth-paths';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // Exclusion: 401 on bootstrap probe must propagate as raw HttpErrorResponse
      // so auth.guard can decide to redirect rather than triggering forced sign-out
      // via AdminErrorHandler.
      if (req.url.endsWith(AUTH_ME_PATH) && err.status === 401) {
        return throwError(() => err);
      }

      switch (err.status) {
        case 401:
          return throwError(() => new UnauthorizedError());
        case 404: {
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          const { resource, id } = parseResourceFromUrl(req.url);
          return throwError(() => new NotFoundError(resource, id));
        }
        case 422: {
          const body = err.error as { errors?: unknown; message?: string } | null;
          return throwError(() => new ValidationError(body?.message ?? err.message, body?.errors));
        }
        default:
          return throwError(() => new ApiError(err.status, err.message, err.error));
      }
    }),
  );
};

/**
 * Best-effort extraction of (resource, id) from URLs like:
 *   /api/cars/123        -> { resource: 'cars', id: '123' }
 *   /tariffs/abc-def     -> { resource: 'tariffs', id: 'abc-def' }
 * Falls back to ('resource', 'unknown') when the pattern doesn't match.
 */
function parseResourceFromUrl(url: string): { resource: string; id: string } {
  const path = url.split('?')[0].replace(/\/+$/, '');
  const parts = path.split('/').filter(Boolean);
  if (parts.length >= 2) {
    return { resource: parts[parts.length - 2], id: parts[parts.length - 1] };
  }
  return { resource: parts[parts.length - 1] ?? 'resource', id: 'unknown' };
}
