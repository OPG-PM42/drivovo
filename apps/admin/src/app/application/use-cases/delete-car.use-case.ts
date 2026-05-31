import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CarService } from '../ports/car.service';

@Injectable({ providedIn: 'root' })
export class DeleteCarUseCase {
  private readonly carService = inject(CarService);

  execute(id: string): Observable<void> {
    return this.carService.delete(id);
  }
}
