import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminPublicView } from '../../domain/admin';
import { AuthGateway } from '../ports/auth.gateway';

/**
 * Application service aggregating all Auth use cases.
 * Pure pass-through over the AuthGateway port. Consume via AuthFacade only.
 */
@Injectable({ providedIn: 'root' })
export class AuthUseCase {
  private readonly authGateway = inject(AuthGateway);

  signIn(email: string, password: string): Observable<AdminPublicView> {
    return this.authGateway.signIn(email, password);
  }

  signOut(): Observable<void> {
    return this.authGateway.signOut();
  }

  getCurrentAdmin(): Observable<AdminPublicView> {
    return this.authGateway.getCurrentAdmin();
  }
}
