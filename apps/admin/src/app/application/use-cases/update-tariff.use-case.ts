import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TariffEntity, TariffUpdate } from '../../domain/tariff';
import { TariffService } from '../ports/tariff.service';

@Injectable({ providedIn: 'root' })
export class UpdateTariffUseCase {
  private readonly tariffService = inject(TariffService);

  execute(id: string, data: TariffUpdate): Observable<TariffEntity> {
    return this.tariffService.update(id, data);
  }
}
