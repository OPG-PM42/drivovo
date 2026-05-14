import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TariffRepository } from '../ports/tariff.repository';

@Injectable({ providedIn: 'root' })
export class DeleteTariffUseCase {
  private readonly tariffRepo = inject(TariffRepository);

  execute(id: string): Observable<void> {
    return this.tariffRepo.delete(id);
  }
}
