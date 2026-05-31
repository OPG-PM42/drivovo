import { Observable } from 'rxjs';
import { TariffEntity, TariffCreate, TariffUpdate } from '../../domain/tariff';

export interface TariffListParams {
  page?: number;
  limit?: number;
  type?: 'leasing' | 'subscription';
}

export interface TariffListResult {
  items: TariffEntity[];
  total: number;
}

export abstract class TariffService {
  abstract getAll(params?: TariffListParams): Observable<TariffListResult>;
  abstract getById(id: string): Observable<TariffEntity>;
  abstract create(data: TariffCreate): Observable<TariffEntity>;
  abstract update(id: string, data: TariffUpdate): Observable<TariffEntity>;
  abstract delete(id: string): Observable<void>;
}
