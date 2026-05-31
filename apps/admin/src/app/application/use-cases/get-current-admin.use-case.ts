import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminPublicView } from '../../domain/admin';
import { AuthGateway } from '../ports/auth.gateway';

@Injectable({ providedIn: 'root' })
export class GetCurrentAdminUseCase {
  private readonly authGateway = inject(AuthGateway);

  execute(): Observable<AdminPublicView> {
    return this.authGateway.getCurrentAdmin();
  }
}
