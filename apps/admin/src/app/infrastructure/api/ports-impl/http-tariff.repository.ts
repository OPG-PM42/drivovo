import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TariffEntity, TariffCreate, TariffUpdate } from '../../../domain/tariff';
import { TariffRepository, TariffListParams, TariffListResult } from '../../../application/ports/tariff.repository';

@Injectable()
export class HttpTariffRepository implements TariffRepository {
  private readonly http = inject(HttpClient);

  getAll(params?: TariffListParams): Observable<TariffListResult> {
    let httpParams = new HttpParams();
    if (params?.page != null) httpParams = httpParams.set('page', params.page);
    if (params?.limit != null) httpParams = httpParams.set('limit', params.limit);
    if (params?.type) httpParams = httpParams.set('type', params.type);
    return this.http.get<TariffListResult>('/tariffs', { params: httpParams });
  }

  getById(id: string): Observable<TariffEntity> {
    return this.http.get<TariffEntity>(`/tariffs/${id}`);
  }

  create(data: TariffCreate): Observable<TariffEntity> {
    return this.http.post<TariffEntity>('/tariffs', data);
  }

  update(id: string, data: TariffUpdate): Observable<TariffEntity> {
    return this.http.patch<TariffEntity>(`/tariffs/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/tariffs/${id}`);
  }
}
