// equivalent of typescript-angular generator output — hand-authored fallback
import { Inject, Injectable, Optional } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SignInRequest } from '../model/sign-in-request';
import { AdminPublicView } from '../model/admin-public-view';
import { SuccessResponse } from '../model/success-response';

import { BASE_PATH } from '../variables';
import { Configuration } from '../configuration';
import { CustomHttpParameterCodec } from '../encoder';

export interface AdminAuthServiceInterface {
  signIn(signInRequest: SignInRequest): Observable<AdminPublicView>;
  signOut(): Observable<SuccessResponse>;
  getCurrentAdmin(): Observable<AdminPublicView>;
}

@Injectable()
export class AdminAuthService implements AdminAuthServiceInterface {
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

  signIn(signInRequest: SignInRequest): Observable<AdminPublicView> {
    return this.httpClient.post<AdminPublicView>(
      `${this.configuration.basePath}/auth/sign-in`,
      signInRequest,
      {
        withCredentials: this.configuration.withCredentials,
        headers: new HttpHeaders({
          Accept: 'application/json',
          'Content-Type': 'application/json',
        }),
      },
    );
  }

  signOut(): Observable<SuccessResponse> {
    return this.httpClient.post<SuccessResponse>(
      `${this.configuration.basePath}/auth/sign-out`,
      {},
      {
        withCredentials: this.configuration.withCredentials,
        headers: new HttpHeaders({
          Accept: 'application/json',
          'Content-Type': 'application/json',
        }),
      },
    );
  }

  getCurrentAdmin(): Observable<AdminPublicView> {
    return this.httpClient.get<AdminPublicView>(`${this.configuration.basePath}/auth/me`, {
      withCredentials: this.configuration.withCredentials,
      headers: new HttpHeaders({ Accept: 'application/json' }),
    });
  }
}
