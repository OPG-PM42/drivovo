// equivalent of typescript-angular generator output — hand-authored fallback
import { Inject, Injectable, Optional } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Car } from '../model/car';
import { CarCreate } from '../model/car-create';
import { CarUpdate } from '../model/car-update';
import { CarListResult } from '../model/car-list-result';
import { IdResponse } from '../model/id-response';
import { SuccessResponse } from '../model/success-response';

import { BASE_PATH } from '../variables';
import { Configuration } from '../configuration';
import { CustomHttpParameterCodec } from '../encoder';

export interface AdminCarsServiceInterface {
  getCars(
    limit?: string,
    offset?: string,
    sortField?: 'name' | 'brand' | 'status',
    sortOrder?: 'asc' | 'desc',
  ): Observable<CarListResult>;
  createCar(carCreate: CarCreate): Observable<IdResponse>;
  getCarById(id: string): Observable<Car>;
  updateCar(id: string, carUpdate: CarUpdate): Observable<SuccessResponse>;
  deleteCar(id: string): Observable<SuccessResponse>;
}

@Injectable()
export class AdminCarsService implements AdminCarsServiceInterface {
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

  getCars(
    limit?: string,
    offset?: string,
    sortField?: 'name' | 'brand' | 'status',
    sortOrder?: 'asc' | 'desc',
  ): Observable<CarListResult> {
    let queryParameters = new HttpParams({ encoder: this.encoder });
    queryParameters = this.addToHttpParams(queryParameters, limit, 'limit');
    queryParameters = this.addToHttpParams(queryParameters, offset, 'offset');
    queryParameters = this.addToHttpParams(queryParameters, sortField, 'sortField');
    queryParameters = this.addToHttpParams(queryParameters, sortOrder, 'sortOrder');

    return this.httpClient.get<CarListResult>(`${this.configuration.basePath}/cars`, {
      params: queryParameters,
      withCredentials: this.configuration.withCredentials,
      headers: new HttpHeaders({ Accept: 'application/json' }),
    });
  }

  createCar(carCreate: CarCreate): Observable<IdResponse> {
    return this.httpClient.post<IdResponse>(`${this.configuration.basePath}/cars`, carCreate, {
      withCredentials: this.configuration.withCredentials,
      headers: new HttpHeaders({
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }),
    });
  }

  getCarById(id: string): Observable<Car> {
    return this.httpClient.get<Car>(
      `${this.configuration.basePath}/cars/${encodeURIComponent(String(id))}`,
      {
        withCredentials: this.configuration.withCredentials,
        headers: new HttpHeaders({ Accept: 'application/json' }),
      },
    );
  }

  updateCar(id: string, carUpdate: CarUpdate): Observable<SuccessResponse> {
    return this.httpClient.patch<SuccessResponse>(
      `${this.configuration.basePath}/cars/${encodeURIComponent(String(id))}`,
      carUpdate,
      {
        withCredentials: this.configuration.withCredentials,
        headers: new HttpHeaders({
          Accept: 'application/json',
          'Content-Type': 'application/json',
        }),
      },
    );
  }

  deleteCar(id: string): Observable<SuccessResponse> {
    return this.httpClient.delete<SuccessResponse>(
      `${this.configuration.basePath}/cars/${encodeURIComponent(String(id))}`,
      {
        withCredentials: this.configuration.withCredentials,
        headers: new HttpHeaders({ Accept: 'application/json' }),
      },
    );
  }
}
