import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CarEntity, CarUpdate } from '../../domain/car';
import { CarRepository } from '../ports/car.repository';

@Injectable({ providedIn: 'root' })
export class UpdateCarUseCase {
  private readonly carRepo = inject(CarRepository);

  execute(id: string, data: CarUpdate): Observable<CarEntity> {
    return this.carRepo.update(id, data);
  }
}
