import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CarEntity, CarCreate, CarUpdate } from '../../domain/car';
import { CarService, CarListParams, CarListResult } from '../ports/car.service';

/**
 * Application service aggregating all Car use cases.
 * Pure pass-through over the CarService port (distinct from that port abstract).
 */
@Injectable({ providedIn: 'root' })
export class CarUseCase {
  private readonly carService = inject(CarService);

  getAll(params?: CarListParams): Observable<CarListResult> {
    return this.carService.getAll(params);
  }

  getById(id: string): Observable<CarEntity> {
    return this.carService.getById(id);
  }

  create(data: CarCreate): Observable<CarEntity> {
    return this.carService.create(data);
  }

  update(id: string, data: CarUpdate): Observable<CarEntity> {
    return this.carService.update(id, data);
  }

  delete(id: string): Observable<void> {
    return this.carService.delete(id);
  }
}
