import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CarService, CarListParams, CarListResult } from '../ports/car.service';

@Injectable({ providedIn: 'root' })
export class GetCarsUseCase {
  private readonly carService = inject(CarService);

  execute(params?: CarListParams): Observable<CarListResult> {
    return this.carService.getAll(params);
  }
}
