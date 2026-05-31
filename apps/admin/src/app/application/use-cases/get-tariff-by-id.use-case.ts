import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TariffEntity } from '../../domain/tariff';
import { TariffService } from '../ports/tariff.service';

@Injectable({ providedIn: 'root' })
export class GetTariffByIdUseCase {
  private readonly tariffService = inject(TariffService);

  execute(id: string): Observable<TariffEntity> {
    return this.tariffService.getById(id);
  }
}
