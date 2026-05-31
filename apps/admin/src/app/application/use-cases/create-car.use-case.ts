import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CarEntity, CarCreate } from '../../domain/car';
import { CarService } from '../ports/car.service';

@Injectable({ providedIn: 'root' })
export class CreateCarUseCase {
  private readonly carService = inject(CarService);

  execute(data: CarCreate): Observable<CarEntity> {
    return this.carService.create(data);
  }
}
