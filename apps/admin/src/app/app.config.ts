import {
  ApplicationConfig,
  ErrorHandler,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { NG_EVENT_PLUGINS } from '@taiga-ui/event-plugins';
import { tuiValidationErrorsProvider } from '@taiga-ui/core';
import { appRoutes } from './app.routes';
import { withCredentialsInterceptor, errorInterceptor } from './infrastructure/http';
import { AdminErrorHandler } from './infrastructure/error-handler';
import { CarRepository } from './application/ports/car.repository';
import { TariffRepository } from './application/ports/tariff.repository';
import { AuthRepository } from './application/ports/auth.repository';
import { HttpCarRepository } from './infrastructure/api/ports-impl/http-car.repository';
import { HttpTariffRepository } from './infrastructure/api/ports-impl/http-tariff.repository';
import { HttpAuthRepository } from './infrastructure/api/ports-impl/http-auth.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([withCredentialsInterceptor, errorInterceptor])),
    provideAnimations(),
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
    { provide: CarRepository, useClass: HttpCarRepository },
    { provide: TariffRepository, useClass: HttpTariffRepository },
    { provide: AuthRepository, useClass: HttpAuthRepository },
  ],
};
