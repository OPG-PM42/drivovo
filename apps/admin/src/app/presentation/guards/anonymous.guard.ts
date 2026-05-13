import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthFacade } from '../../application/state/auth.facade';

export const anonymousGuard: CanActivateFn = () => {
  const facade = inject(AuthFacade);
  const router = inject(Router);

  if (facade.isAuthenticated()) {
    return router.createUrlTree(['/']);
  }
  return true;
};
