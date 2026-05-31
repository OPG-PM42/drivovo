import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TariffService } from '../ports/tariff.service';

@Injectable({ providedIn: 'root' })
export class DeleteTariffUseCase {
  private readonly tariffService = inject(TariffService);

  execute(id: string): Observable<void> {
    return this.tariffService.delete(id);
  }
}
