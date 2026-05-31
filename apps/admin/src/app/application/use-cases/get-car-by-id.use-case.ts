import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CarEntity } from '../../domain/car';
import { CarService } from '../ports/car.service';

@Injectable({ providedIn: 'root' })
export class GetCarByIdUseCase {
  private readonly carService = inject(CarService);

  execute(id: string): Observable<CarEntity> {
    return this.carService.getById(id);
  }
}
