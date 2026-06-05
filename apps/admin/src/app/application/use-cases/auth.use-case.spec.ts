import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Injector } from '@angular/core';
import { of, throwError } from 'rxjs';
import { AuthUseCase } from './auth.use-case';
import { AuthGateway } from '../ports/auth.gateway';
import { ApiError } from '../../domain/errors';
import { AdminPublicView } from '../../domain/admin';

describe('AuthUseCase', () => {
  let useCase: AuthUseCase;
  let gateway: jest.Mocked<AuthGateway>;

  const admin: AdminPublicView = { id: '1', email: 'a@b.c', name: 'A', role: 'admin', createdAt: new Date(0), updatedAt: new Date(0) };

  beforeEach(() => {
    const mock: jest.Mocked<AuthGateway> = {
      signIn: jest.fn(),
      signOut: jest.fn(),
      getCurrentAdmin: jest.fn(),
    } as jest.Mocked<AuthGateway>;

    const injector = Injector.create({
      providers: [
        { provide: AuthUseCase, useClass: AuthUseCase },
        { provide: AuthGateway, useValue: mock },
      ],
    });

    useCase = injector.get(AuthUseCase);
    gateway = mock;
  });

  it('signIn delegates to AuthGateway.signIn with email and password', (done) => {
    gateway.signIn.mockReturnValue(of(admin));

    useCase.signIn('a@b.c', 'pwd').subscribe({
      next: (result) => {
        expect(result).toBe(admin);
        expect(gateway.signIn).toHaveBeenCalledWith('a@b.c', 'pwd');
        expect(gateway.signIn).toHaveBeenCalledTimes(1);
        (done as () => void)();
      },
    });
  });

  it('signOut delegates to AuthGateway.signOut', (done) => {
    gateway.signOut.mockReturnValue(of(undefined));

    useCase.signOut().subscribe({
      next: () => {
        expect(gateway.signOut).toHaveBeenCalledTimes(1);
        (done as () => void)();
      },
    });
  });

  it('getCurrentAdmin delegates to AuthGateway.getCurrentAdmin', (done) => {
    gateway.getCurrentAdmin.mockReturnValue(of(admin));

    useCase.getCurrentAdmin().subscribe({
      next: (result) => {
        expect(result).toBe(admin);
        expect(gateway.getCurrentAdmin).toHaveBeenCalledTimes(1);
        (done as () => void)();
      },
    });
  });

  it('propagates ApiError from gateway', (done) => {
    const err = new ApiError(500, 'internal error');
    gateway.getCurrentAdmin.mockReturnValue(throwError(() => err));

    useCase.getCurrentAdmin().subscribe({
      error: (e) => {
        expect(e).toBe(err);
        (done as () => void)();
      },
    });
  });
});
