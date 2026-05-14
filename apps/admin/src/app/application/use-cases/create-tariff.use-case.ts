import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TariffEntity, TariffCreate } from '../../domain/tariff';
import { TariffRepository } from '../ports/tariff.repository';

@Injectable({ providedIn: 'root' })
export class CreateTariffUseCase {
  private readonly tariffRepo = inject(TariffRepository);

  execute(data: TariffCreate): Observable<TariffEntity> {
    return this.tariffRepo.create(data);
  }
}
