import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TariffRepository, TariffListParams, TariffListResult } from '../ports/tariff.repository';

@Injectable({ providedIn: 'root' })
export class GetTariffsUseCase {
  private readonly tariffRepo = inject(TariffRepository);

  execute(params?: TariffListParams): Observable<TariffListResult> {
    return this.tariffRepo.getAll(params);
  }
}
