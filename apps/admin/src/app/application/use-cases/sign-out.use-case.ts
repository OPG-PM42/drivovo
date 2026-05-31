import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthGateway } from '../ports/auth.gateway';

@Injectable({ providedIn: 'root' })
export class SignOutUseCase {
  private readonly authGateway = inject(AuthGateway);

  execute(): Observable<void> {
    return this.authGateway.signOut();
  }
}
