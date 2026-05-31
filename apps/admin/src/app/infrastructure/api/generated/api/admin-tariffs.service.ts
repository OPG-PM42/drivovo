// equivalent of typescript-angular generator output — hand-authored fallback
import { Inject, Injectable, Optional } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Tariff } from '../model/tariff';
import { TariffCreate } from '../model/tariff-create';
import { TariffUpdate } from '../model/tariff-update';
import { TariffListResult } from '../model/tariff-list-result';
import { IdResponse } from '../model/id-response';
import { SuccessResponse } from '../model/success-response';

import { BASE_PATH } from '../variables';
import { Configuration } from '../configuration';
import { CustomHttpParameterCodec } from '../encoder';

export interface AdminTariffsServiceInterface {
  getTariffs(
    limit?: string,
    offset?: string,
    sortField?: 'name' | 'type',
    sortOrder?: 'asc' | 'desc',
    type?: 'leasing' | 'subscription',
  ): Observable<TariffListResult>;
  createTariff(tariffCreate: TariffCreate): Observable<IdResponse>;
  getTariffById(id: string): Observable<Tariff>;
  updateTariff(id: string, tariffUpdate: TariffUpdate): Observable<SuccessResponse>;
  deleteTariff(id: string): Observable<SuccessResponse>;
}

@Injectable()
export class AdminTariffsService implements AdminTariffsServiceInterface {
  protected basePath = '';
  public configuration = new Configuration();
  public encoder: CustomHttpParameterCodec;

  constructor(
    protected httpClient: HttpClient,
    @Optional() @Inject(BASE_PATH) basePath?: string | string[],
    @Optional() configuration?: Configuration,
  ) {
    if (configuration) {
      this.configuration = configuration;
    }
    if (typeof this.configuration.basePath !== 'string') {
      if (Array.isArray(basePath) && basePath.length > 0) {
        basePath = basePath[0];
      }
      if (typeof basePath !== 'string') {
        basePath = this.basePath;
      }
      this.configuration.basePath = basePath;
    }
    this.encoder = new CustomHttpParameterCodec();
  }

  private addToHttpParams(
    httpParams: HttpParams,
    value: unknown,
    key?: string,
  ): HttpParams {
    if (value == null) {
      return httpParams;
    }
    if (key != null) {
      return httpParams.append(key, String(value));
    }
    return httpParams;
  }

  getTariffs(
    limit?: string,
    offset?: string,
    sortField?: 'name' | 'type',
    sortOrder?: 'asc' | 'desc',
    type?: 'leasing' | 'subscription',
  ): Observable<TariffListResult> {
    let queryParameters = new HttpParams({ encoder: this.encoder });
    queryParameters = this.addToHttpParams(queryParameters, limit, 'limit');
    queryParameters = this.addToHttpParams(queryParameters, offset, 'offset');
    queryParameters = this.addToHttpParams(queryParameters, sortField, 'sortField');
    queryParameters = this.addToHttpParams(queryParameters, sortOrder, 'sortOrder');
    queryParameters = this.addToHttpParams(queryParameters, type, 'type');

    return this.httpClient.get<TariffListResult>(`${this.configuration.basePath}/tariffs`, {
      params: queryParameters,
      withCredentials: this.configuration.withCredentials,
      headers: new HttpHeaders({ Accept: 'application/json' }),
    });
  }

  createTariff(tariffCreate: TariffCreate): Observable<IdResponse> {
    return this.httpClient.post<IdResponse>(`${this.configuration.basePath}/tariffs`, tariffCreate, {
      withCredentials: this.configuration.withCredentials,
      headers: new HttpHeaders({
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }),
    });
  }

  getTariffById(id: string): Observable<Tariff> {
    return this.httpClient.get<Tariff>(
      `${this.configuration.basePath}/tariffs/${encodeURIComponent(String(id))}`,
      {
        withCredentials: this.configuration.withCredentials,
        headers: new HttpHeaders({ Accept: 'application/json' }),
      },
    );
  }

  updateTariff(id: string, tariffUpdate: TariffUpdate): Observable<SuccessResponse> {
    return this.httpClient.patch<SuccessResponse>(
      `${this.configuration.basePath}/tariffs/${encodeURIComponent(String(id))}`,
      tariffUpdate,
      {
        withCredentials: this.configuration.withCredentials,
        headers: new HttpHeaders({
          Accept: 'application/json',
          'Content-Type': 'application/json',
        }),
      },
    );
  }

  deleteTariff(id: string): Observable<SuccessResponse> {
    return this.httpClient.delete<SuccessResponse>(
      `${this.configuration.basePath}/tariffs/${encodeURIComponent(String(id))}`,
      {
        withCredentials: this.configuration.withCredentials,
        headers: new HttpHeaders({ Accept: 'application/json' }),
      },
    );
  }
}
