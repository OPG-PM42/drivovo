import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CarEntity } from '../../domain/car';
import { CarRepository } from '../ports/car.repository';

@Injectable({ providedIn: 'root' })
export class GetCarByIdUseCase {
  private readonly carRepo = inject(CarRepository);

  execute(id: string): Observable<CarEntity> {
    return this.carRepo.getById(id);
  }
}
