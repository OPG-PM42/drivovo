import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminEntity } from '../../domain/admin';
import { AuthRepository } from '../ports/auth.repository';

@Injectable({ providedIn: 'root' })
export class GetCurrentAdminUseCase {
  private readonly authRepo = inject(AuthRepository);

  execute(): Observable<AdminEntity> {
    return this.authRepo.getCurrentAdmin();
  }
}
