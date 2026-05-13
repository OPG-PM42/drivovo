import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { GetCurrentAdminUseCase } from '../../application/use-cases/get-current-admin.use-case';
import { AuthStore } from '../../application/state/auth.store';

export const authGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const getCurrentAdmin = inject(GetCurrentAdminUseCase);

  if (authStore.isAuthenticated()) {
    return true;
  }

  return getCurrentAdmin.execute().pipe(
    map((admin) => {
      authStore.setAdmin(admin);
      return true;
    }),
    catchError(() => of(router.createUrlTree(['/login']))),
  );
};
