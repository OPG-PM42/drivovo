import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Injector } from '@angular/core';
import { of, throwError } from 'rxjs';
import { GetCurrentAdminUseCase } from './get-current-admin.use-case';
import { AuthGateway } from '../ports/auth.gateway';
import { UnauthorizedError } from '../../domain/errors';
import { AdminPublicView } from '../../domain/admin';

describe('GetCurrentAdminUseCase', () => {
  let useCase: GetCurrentAdminUseCase;
  let gateway: jest.Mocked<AuthGateway>;

  beforeEach(() => {
    const mock: jest.Mocked<AuthGateway> = {
      signIn: jest.fn(),
      signOut: jest.fn(),
      getCurrentAdmin: jest.fn(),
    } as jest.Mocked<AuthGateway>;

    const injector = Injector.create({
      providers: [
        { provide: GetCurrentAdminUseCase, useClass: GetCurrentAdminUseCase },
        { provide: AuthGateway, useValue: mock },
      ],
    });

    useCase = injector.get(GetCurrentAdminUseCase);
    gateway = mock;
  });

  it('delegates to AuthGateway.getCurrentAdmin', (done) => {
    const admin: AdminPublicView = { id: '42', email: 'admin@example.com', name: 'Admin', role: 'admin' } as AdminPublicView;
    gateway.getCurrentAdmin.mockReturnValue(of(admin));

    useCase.execute().subscribe({
      next: (result) => {
        expect(result).toBe(admin);
        expect(gateway.getCurrentAdmin).toHaveBeenCalledTimes(1);
        (done as () => void)();
      },
    });
  });

  it('propagates UnauthorizedError from gateway', (done) => {
    const err = new UnauthorizedError();
    gateway.getCurrentAdmin.mockReturnValue(throwError(() => err));

    useCase.execute().subscribe({
      error: (caught) => {
        expect(caught).toBe(err);
        (done as () => void)();
      },
    });
  });
});
