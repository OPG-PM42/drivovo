import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TariffEntity, TariffUpdate } from '../../domain/tariff';
import { TariffRepository } from '../ports/tariff.repository';

@Injectable({ providedIn: 'root' })
export class UpdateTariffUseCase {
  private readonly tariffRepo = inject(TariffRepository);

  execute(id: string, data: TariffUpdate): Observable<TariffEntity> {
    return this.tariffRepo.update(id, data);
  }
}
