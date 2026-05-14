import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CarEntity, CarCreate } from '../../domain/car';
import { CarRepository } from '../ports/car.repository';

@Injectable({ providedIn: 'root' })
export class CreateCarUseCase {
  private readonly carRepo = inject(CarRepository);

  execute(data: CarCreate): Observable<CarEntity> {
    return this.carRepo.create(data);
  }
}
