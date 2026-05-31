import { Observable } from 'rxjs';
import { CarEntity, CarCreate, CarUpdate } from '../../domain/car';

export interface CarListParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface CarListResult {
  items: CarEntity[];
  total: number;
}

export abstract class CarService {
  abstract getAll(params?: CarListParams): Observable<CarListResult>;
  abstract getById(id: string): Observable<CarEntity>;
  abstract create(data: CarCreate): Observable<CarEntity>;
  abstract update(id: string, data: CarUpdate): Observable<CarEntity>;
  abstract delete(id: string): Observable<void>;
}
