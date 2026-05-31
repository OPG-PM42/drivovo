import {
  ApplicationConfig,
  ErrorHandler,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { NG_EVENT_PLUGINS } from '@taiga-ui/event-plugins';
import { tuiValidationErrorsProvider } from '@taiga-ui/core';
import { appRoutes } from './app.routes';
import { withCredentialsInterceptor, errorInterceptor } from './infrastructure/http';
import { AdminErrorHandler } from './infrastructure/error-handler';
import { environment } from '../environments/environment';
import {
  BASE_PATH,
  Configuration,
  AdminCarsService,
  AdminTariffsService,
  AdminAuthService,
} from './infrastructure/api/generated';
import { CarService } from './application/ports/car.service';
import { TariffService } from './application/ports/tariff.service';
import { AuthGateway } from './application/ports/auth.gateway';
import { HttpCarService } from './infrastructure/api/services/http-car.service';
import { HttpTariffService } from './infrastructure/api/services/http-tariff.service';
import { HttpAuthGateway } from './infrastructure/api/services/http-auth.gateway';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([withCredentialsInterceptor, errorInterceptor])),
    provideAnimationsAsync(),
    ...NG_EVENT_PLUGINS,
    tuiValidationErrorsProvider({
      required: 'Поле обязательно для заполнения',
      email: 'Некорректный e-mail',
      minlength: ({ requiredLength }: { requiredLength: number }) =>
        `Минимум ${requiredLength} символов`,
      maxlength: ({ requiredLength }: { requiredLength: number }) =>
        `Максимум ${requiredLength} символов`,
      min: ({ min }: { min: number }) => `Минимум ${min}`,
      max: ({ max }: { max: number }) => `Максимум ${max}`,
    }),
    { provide: ErrorHandler, useClass: AdminErrorHandler },
    { provide: BASE_PATH, useValue: environment.apiBasePath },
    {
      provide: Configuration,
      useFactory: () =>
        new Configuration({ basePath: environment.apiBasePath, withCredentials: true }),
    },
    AdminCarsService,
    AdminTariffsService,
    AdminAuthService,
    { provide: CarService, useClass: HttpCarService },
    { provide: TariffService, useClass: HttpTariffService },
    { provide: AuthGateway, useClass: HttpAuthGateway },
  ],
};
