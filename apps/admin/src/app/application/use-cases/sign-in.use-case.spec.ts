import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Injector } from '@angular/core';
import { of, throwError } from 'rxjs';
import { SignInUseCase } from './sign-in.use-case';
import { AuthRepository } from '../ports/auth.repository';
import { UnauthorizedError } from '../../domain/errors';
import { AdminEntity } from '../../domain/admin';

describe('SignInUseCase', () => {
  let useCase: SignInUseCase;
  let repo: jest.Mocked<AuthRepository>;

  beforeEach(() => {
    const mock: jest.Mocked<AuthRepository> = {
      signIn: jest.fn(),
      signOut: jest.fn(),
      getCurrentAdmin: jest.fn(),
    } as jest.Mocked<AuthRepository>;

    const injector = Injector.create({
      providers: [
        { provide: SignInUseCase, useClass: SignInUseCase },
        { provide: AuthRepository, useValue: mock },
      ],
    });

    useCase = injector.get(SignInUseCase);
    repo = mock;
  });

  it('delegates to AuthRepository.signIn with email and password', (done) => {
    const admin: AdminEntity = { id: '1', email: 'a@b.c', name: 'A', role: 'admin' };
    repo.signIn.mockReturnValue(of(admin));

    useCase.execute('a@b.c', 'pwd').subscribe({
      next: (result) => {
        expect(result).toBe(admin);
        expect(repo.signIn).toHaveBeenCalledWith('a@b.c', 'pwd');
        expect(repo.signIn).toHaveBeenCalledTimes(1);
        (done as () => void)();
      },
    });
  });

  it('propagates UnauthorizedError from repository (no error transformation)', (done) => {
    const err = new UnauthorizedError();
    repo.signIn.mockReturnValue(throwError(() => err));

    useCase.execute('a@b.c', 'wrong').subscribe({
      error: (caught) => {
        expect(caught).toBe(err);
        (done as () => void)();
      },
    });
  });
});
