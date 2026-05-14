import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthFacade } from '../../application/state/auth.facade';

export const authGuard: CanActivateFn = () => {
  const facade = inject(AuthFacade);
  const router = inject(Router);

  if (facade.isAuthenticated()) return of(true);

  return facade.loadCurrent().pipe(
    map((admin) => admin ? true : router.createUrlTree(['/login'])),
    catchError(() => of(router.createUrlTree(['/login']))),
  );
};
