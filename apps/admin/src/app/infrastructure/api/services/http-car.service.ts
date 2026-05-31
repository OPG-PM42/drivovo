import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { CarEntity, CarCreate, CarUpdate } from '../../../domain/car';
import {
  CarService,
  CarListParams,
  CarListResult,
} from '../../../application/ports/car.service';
import { AdminCarsService } from '../generated';
import {
  toCarEntity,
  toGeneratedCarCreate,
  toGeneratedCarUpdate,
} from '../mappers/car.mapper';

@Injectable()
export class HttpCarService implements CarService {
  private readonly api = inject(AdminCarsService);

  getAll(params?: CarListParams): Observable<CarListResult> {
    const limit = params?.limit != null ? String(params.limit) : undefined;
    const offset =
      params?.page != null && params?.limit != null
        ? String((params.page - 1) * params.limit)
        : params?.page != null
          ? String(params.page)
          : undefined;
    const sortField = params?.sort as 'name' | 'brand' | 'status' | undefined;
    const sortOrder = params?.order;
    return this.api.getCars(limit, offset, sortField, sortOrder).pipe(
      map((res) => ({
        items: res.items.map(toCarEntity),
        total: res.total,
      })),
    );
  }

  getById(id: string): Observable<CarEntity> {
    return this.api.getCarById(id).pipe(map(toCarEntity));
  }

  create(data: CarCreate): Observable<CarEntity> {
    return this.api.createCar(toGeneratedCarCreate(data)).pipe(
      map((res) => ({ ...(data as unknown as CarEntity), id: res.id })),
    );
  }

  update(id: string, data: CarUpdate): Observable<CarEntity> {
    return this.api
      .updateCar(id, toGeneratedCarUpdate(data))
      .pipe(map(() => ({ ...(data as unknown as CarEntity), id })));
  }

  delete(id: string): Observable<void> {
    return this.api.deleteCar(id).pipe(map(() => undefined));
  }
}
