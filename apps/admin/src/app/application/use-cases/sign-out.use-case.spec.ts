import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Injector } from '@angular/core';
import { of, throwError } from 'rxjs';
import { SignOutUseCase } from './sign-out.use-case';
import { AuthRepository } from '../ports/auth.repository';

describe('SignOutUseCase', () => {
  let useCase: SignOutUseCase;
  let repo: jest.Mocked<AuthRepository>;

  beforeEach(() => {
    const mock: jest.Mocked<AuthRepository> = {
      signIn: jest.fn(),
      signOut: jest.fn(),
      getCurrentAdmin: jest.fn(),
    } as jest.Mocked<AuthRepository>;

    const injector = Injector.create({
      providers: [
        { provide: SignOutUseCase, useClass: SignOutUseCase },
        { provide: AuthRepository, useValue: mock },
      ],
    });

    useCase = injector.get(SignOutUseCase);
    repo = mock;
  });

  it('delegates to AuthRepository.signOut', (done) => {
    repo.signOut.mockReturnValue(of(undefined));

    useCase.execute().subscribe({
      next: (result) => {
        expect(result).toBeUndefined();
        expect(repo.signOut).toHaveBeenCalledTimes(1);
        (done as () => void)();
      },
    });
  });

  it('propagates error from repository', (done) => {
    const err = new Error('network');
    repo.signOut.mockReturnValue(throwError(() => err));

    useCase.execute().subscribe({
      error: (caught) => {
        expect(caught).toBe(err);
        (done as () => void)();
      },
    });
  });
});
