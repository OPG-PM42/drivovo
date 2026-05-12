import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminEntity } from '../../domain/admin';
import { AuthRepository } from '../ports/auth.repository';

@Injectable({ providedIn: 'root' })
export class SignInUseCase {
  private readonly authRepo = inject(AuthRepository);

  execute(email: string, password: string): Observable<AdminEntity> {
    return this.authRepo.signIn(email, password);
  }
}
