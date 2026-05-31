import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  TariffService,
  TariffListParams,
  TariffListResult,
} from '../ports/tariff.service';

@Injectable({ providedIn: 'root' })
export class GetTariffsUseCase {
  private readonly tariffService = inject(TariffService);

  execute(params?: TariffListParams): Observable<TariffListResult> {
    return this.tariffService.getAll(params);
  }
}
