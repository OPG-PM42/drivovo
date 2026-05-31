import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { TariffEntity, TariffCreate, TariffUpdate } from '../../../domain/tariff';
import {
  TariffService,
  TariffListParams,
  TariffListResult,
} from '../../../application/ports/tariff.service';
import { AdminTariffsService } from '../generated';
import {
  toTariffEntity,
  toGeneratedTariffCreate,
  toGeneratedTariffUpdate,
} from '../mappers/tariff.mapper';

@Injectable()
export class HttpTariffService implements TariffService {
  private readonly api = inject(AdminTariffsService);

  getAll(params?: TariffListParams): Observable<TariffListResult> {
    const limit = params?.limit != null ? String(params.limit) : undefined;
    const offset =
      params?.page != null && params?.limit != null
        ? String((params.page - 1) * params.limit)
        : params?.page != null
          ? String(params.page)
          : undefined;
    return this.api.getTariffs(limit, offset, undefined, undefined, params?.type).pipe(
      map((res) => ({
        items: res.items.map(toTariffEntity),
        total: res.total,
      })),
    );
  }

  getById(id: string): Observable<TariffEntity> {
    return this.api.getTariffById(id).pipe(map(toTariffEntity));
  }

  create(data: TariffCreate): Observable<TariffEntity> {
    return this.api.createTariff(toGeneratedTariffCreate(data)).pipe(
      map((res) => ({
        id: res.id,
        name: data.name,
        type: data.type,
        options: data.options ?? [],
      })),
    );
  }

  update(id: string, data: TariffUpdate): Observable<TariffEntity> {
    return this.api.updateTariff(id, toGeneratedTariffUpdate(data)).pipe(
      map(() => ({
        id,
        name: data.name ?? '',
        type: data.type ?? 'leasing',
        options: data.options ?? [],
      })),
    );
  }

  delete(id: string): Observable<void> {
    return this.api.deleteTariff(id).pipe(map(() => undefined));
  }
}
