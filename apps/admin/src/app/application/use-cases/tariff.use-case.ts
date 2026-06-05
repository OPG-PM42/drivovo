import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TariffEntity, TariffCreate, TariffUpdate } from '../../domain/tariff';
import { TariffService, TariffListParams, TariffListResult } from '../ports/tariff.service';

/**
 * Application service aggregating all Tariff use cases.
 * Pure pass-through over the TariffService port (distinct from that port abstract).
 */
@Injectable({ providedIn: 'root' })
export class TariffUseCase {
  private readonly tariffService = inject(TariffService);

  getAll(params?: TariffListParams): Observable<TariffListResult> {
    return this.tariffService.getAll(params);
  }

  getById(id: string): Observable<TariffEntity> {
    return this.tariffService.getById(id);
  }

  create(data: TariffCreate): Observable<TariffEntity> {
    return this.tariffService.create(data);
  }

  update(id: string, data: TariffUpdate): Observable<TariffEntity> {
    return this.tariffService.update(id, data);
  }

  delete(id: string): Observable<void> {
    return this.tariffService.delete(id);
  }
}
