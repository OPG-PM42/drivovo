import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AdminPublicView } from '../../../domain/admin';
import { AuthGateway } from '../../../application/ports/auth.gateway';
import { AdminAuthService } from '../generated';
import { toAdminPublicView } from '../mappers/admin.mapper';

@Injectable()
export class HttpAuthGateway implements AuthGateway {
  private readonly api = inject(AdminAuthService);

  signIn(email: string, password: string): Observable<AdminPublicView> {
    return this.api.signIn({ email, password }).pipe(map(toAdminPublicView));
  }

  signOut(): Observable<void> {
    return this.api.signOut().pipe(map(() => undefined));
  }

  getCurrentAdmin(): Observable<AdminPublicView> {
    return this.api.getCurrentAdmin().pipe(map(toAdminPublicView));
  }
}
