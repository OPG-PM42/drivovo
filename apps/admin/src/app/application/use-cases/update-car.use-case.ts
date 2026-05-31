import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CarEntity, CarUpdate } from '../../domain/car';
import { CarService } from '../ports/car.service';

@Injectable({ providedIn: 'root' })
export class UpdateCarUseCase {
  private readonly carService = inject(CarService);

  execute(id: string, data: CarUpdate): Observable<CarEntity> {
    return this.carService.update(id, data);
  }
}
