import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthRepository } from '../ports/auth.repository';

@Injectable({ providedIn: 'root' })
export class SignOutUseCase {
  private readonly authRepo = inject(AuthRepository);

  execute(): Observable<void> {
    return this.authRepo.signOut();
  }
}
