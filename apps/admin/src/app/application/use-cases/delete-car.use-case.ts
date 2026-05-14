import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CarRepository } from '../ports/car.repository';

@Injectable({ providedIn: 'root' })
export class DeleteCarUseCase {
  private readonly carRepo = inject(CarRepository);

  execute(id: string): Observable<void> {
    return this.carRepo.delete(id);
  }
}
