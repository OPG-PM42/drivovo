import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CarRepository, CarListParams, CarListResult } from '../ports/car.repository';

@Injectable({ providedIn: 'root' })
export class GetCarsUseCase {
  private readonly carRepo = inject(CarRepository);

  execute(params?: CarListParams): Observable<CarListResult> {
    return this.carRepo.getAll(params);
  }
}
