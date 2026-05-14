import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TariffEntity } from '../../domain/tariff';
import { TariffRepository } from '../ports/tariff.repository';

@Injectable({ providedIn: 'root' })
export class GetTariffByIdUseCase {
  private readonly tariffRepo = inject(TariffRepository);

  execute(id: string): Observable<TariffEntity> {
    return this.tariffRepo.getById(id);
  }
}
