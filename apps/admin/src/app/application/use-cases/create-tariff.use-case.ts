import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TariffEntity, TariffCreate } from '../../domain/tariff';
import { TariffService } from '../ports/tariff.service';

@Injectable({ providedIn: 'root' })
export class CreateTariffUseCase {
  private readonly tariffService = inject(TariffService);

  execute(data: TariffCreate): Observable<TariffEntity> {
    return this.tariffService.create(data);
  }
}
