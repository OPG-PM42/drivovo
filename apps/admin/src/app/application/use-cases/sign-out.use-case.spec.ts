import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Injector } from '@angular/core';
import { of, throwError } from 'rxjs';
import { SignOutUseCase } from './sign-out.use-case';
import { AuthGateway } from '../ports/auth.gateway';

describe('SignOutUseCase', () => {
  let useCase: SignOutUseCase;
  let gateway: jest.Mocked<AuthGateway>;

  beforeEach(() => {
    const mock: jest.Mocked<AuthGateway> = {
      signIn: jest.fn(),
      signOut: jest.fn(),
      getCurrentAdmin: jest.fn(),
    } as jest.Mocked<AuthGateway>;

    const injector = Injector.create({
      providers: [
        { provide: SignOutUseCase, useClass: SignOutUseCase },
        { provide: AuthGateway, useValue: mock },
      ],
    });

    useCase = injector.get(SignOutUseCase);
    gateway = mock;
  });

  it('delegates to AuthGateway.signOut', (done) => {
    gateway.signOut.mockReturnValue(of(undefined));

    useCase.execute().subscribe({
      next: (result) => {
        expect(result).toBeUndefined();
        expect(gateway.signOut).toHaveBeenCalledTimes(1);
        (done as () => void)();
      },
    });
  });

  it('propagates error from gateway', (done) => {
    const err = new Error('network');
    gateway.signOut.mockReturnValue(throwError(() => err));

    useCase.execute().subscribe({
      error: (caught) => {
        expect(caught).toBe(err);
        (done as () => void)();
      },
    });
  });
});
