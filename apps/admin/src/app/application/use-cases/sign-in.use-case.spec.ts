import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Injector } from '@angular/core';
import { of, throwError } from 'rxjs';
import { SignInUseCase } from './sign-in.use-case';
import { AuthGateway } from '../ports/auth.gateway';
import { UnauthorizedError } from '../../domain/errors';
import { AdminPublicView } from '../../domain/admin';

describe('SignInUseCase', () => {
  let useCase: SignInUseCase;
  let gateway: jest.Mocked<AuthGateway>;

  beforeEach(() => {
    const mock: jest.Mocked<AuthGateway> = {
      signIn: jest.fn(),
      signOut: jest.fn(),
      getCurrentAdmin: jest.fn(),
    } as jest.Mocked<AuthGateway>;

    const injector = Injector.create({
      providers: [
        { provide: SignInUseCase, useClass: SignInUseCase },
        { provide: AuthGateway, useValue: mock },
      ],
    });

    useCase = injector.get(SignInUseCase);
    gateway = mock;
  });

  it('delegates to AuthGateway.signIn with email and password', (done) => {
    const admin: AdminPublicView = { id: '1', email: 'a@b.c', name: 'A', role: 'admin' } as AdminPublicView;
    gateway.signIn.mockReturnValue(of(admin));

    useCase.execute('a@b.c', 'pwd').subscribe({
      next: (result) => {
        expect(result).toBe(admin);
        expect(gateway.signIn).toHaveBeenCalledWith('a@b.c', 'pwd');
        expect(gateway.signIn).toHaveBeenCalledTimes(1);
        (done as () => void)();
      },
    });
  });

  it('propagates UnauthorizedError from gateway (no error transformation)', (done) => {
    const err = new UnauthorizedError();
    gateway.signIn.mockReturnValue(throwError(() => err));

    useCase.execute('a@b.c', 'wrong').subscribe({
      error: (caught) => {
        expect(caught).toBe(err);
        (done as () => void)();
      },
    });
  });
});
