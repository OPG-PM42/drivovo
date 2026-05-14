import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CarEntity, CarCreate, CarUpdate } from '../../../domain/car';
import { CarRepository, CarListParams, CarListResult } from '../../../application/ports/car.repository';

@Injectable()
export class HttpCarRepository implements CarRepository {
  private readonly http = inject(HttpClient);

  getAll(params?: CarListParams): Observable<CarListResult> {
    let httpParams = new HttpParams();
    if (params?.page != null) httpParams = httpParams.set('page', params.page);
    if (params?.limit != null) httpParams = httpParams.set('limit', params.limit);
    if (params?.sort) httpParams = httpParams.set('sort', params.sort);
    if (params?.order) httpParams = httpParams.set('order', params.order);
    return this.http.get<CarListResult>('/cars', { params: httpParams });
  }

  getById(id: string): Observable<CarEntity> {
    return this.http.get<CarEntity>(`/cars/${id}`);
  }

  create(data: CarCreate): Observable<CarEntity> {
    return this.http.post<CarEntity>('/cars', data);
  }

  update(id: string, data: CarUpdate): Observable<CarEntity> {
    return this.http.patch<CarEntity>(`/cars/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/cars/${id}`);
  }
}
