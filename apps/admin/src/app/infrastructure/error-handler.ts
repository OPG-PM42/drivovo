import { ErrorHandler, Injectable, NgZone, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthFacade } from '../application/state/auth.facade';
import { UnauthorizedError } from '../domain/errors';

@Injectable()
export class AdminErrorHandler implements ErrorHandler {
  private readonly zone = inject(NgZone);
  private readonly router = inject(Router);
  private readonly facade = inject(AuthFacade);

  handleError(error: unknown): void {
    if (error instanceof UnauthorizedError) {
      this.zone.run(() => {
        this.facade.signOutLocal();
        void this.router.navigate(['/login']);
      });
      // eslint-disable-next-line no-console
      console.warn('[AdminErrorHandler] forced sign-out due to 401');
      return;
    }

    // eslint-disable-next-line no-console
    console.error('[AdminErrorHandler]', error);
  }
}
