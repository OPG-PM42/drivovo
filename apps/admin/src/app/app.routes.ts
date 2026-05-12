import { Route } from '@angular/router';
import { authGuard } from './presentation/guards/auth.guard';
import { anonymousGuard } from './presentation/guards/anonymous.guard';
import { dirtyFormGuard } from './presentation/guards/dirty-form.guard';

export const appRoutes: Route[] = [
  {
    path: 'login',
    canActivate: [anonymousGuard],
    loadComponent: () =>
      import('./presentation/pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./presentation/layout/shell.component').then((m) => m.ShellComponent),
    children: [
      { path: '', redirectTo: 'cars', pathMatch: 'full' },
      {
        path: 'cars',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./presentation/pages/cars/car-list.page').then((m) => m.CarListPage),
          },
          {
            path: 'new',
            canDeactivate: [dirtyFormGuard],
            loadComponent: () =>
              import('./presentation/pages/cars/car-form.page').then((m) => m.CarFormPage),
          },
          {
            path: ':id/edit',
            canDeactivate: [dirtyFormGuard],
            loadComponent: () =>
              import('./presentation/pages/cars/car-form.page').then((m) => m.CarFormPage),
          },
        ],
      },
      {
        path: 'tariffs',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./presentation/pages/tariffs/tariff-list.page').then(
                (m) => m.TariffListPage,
              ),
          },
          {
            path: 'new',
            canDeactivate: [dirtyFormGuard],
            loadComponent: () =>
              import('./presentation/pages/tariffs/tariff-form.page').then(
                (m) => m.TariffFormPage,
              ),
          },
          {
            path: ':id/edit',
            canDeactivate: [dirtyFormGuard],
            loadComponent: () =>
              import('./presentation/pages/tariffs/tariff-form.page').then(
                (m) => m.TariffFormPage,
              ),
          },
        ],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
