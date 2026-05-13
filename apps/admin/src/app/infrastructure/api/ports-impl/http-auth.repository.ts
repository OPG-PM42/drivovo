import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminEntity } from '../../../domain/admin';
import { AuthRepository } from '../../../application/ports/auth.repository';
import { AUTH_ME_PATH } from '../../http/auth-paths';

@Injectable()
export class HttpAuthRepository implements AuthRepository {
  private readonly http = inject(HttpClient);

  signIn(email: string, password: string): Observable<AdminEntity> {
    return this.http.post<AdminEntity>('/auth/sign-in', { email, password });
  }

  signOut(): Observable<void> {
    return this.http.post<void>('/auth/sign-out', {});
  }

  getCurrentAdmin(): Observable<AdminEntity> {
    return this.http.get<AdminEntity>(AUTH_ME_PATH);
  }
}
