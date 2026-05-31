import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminPublicView } from '../../domain/admin';
import { AuthGateway } from '../ports/auth.gateway';

@Injectable({ providedIn: 'root' })
export class SignInUseCase {
  private readonly authGateway = inject(AuthGateway);

  execute(email: string, password: string): Observable<AdminPublicView> {
    return this.authGateway.signIn(email, password);
  }
}
