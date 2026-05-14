import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Injector } from '@angular/core';
import { of, throwError } from 'rxjs';
import { GetCurrentAdminUseCase } from './get-current-admin.use-case';
import { AuthRepository } from '../ports/auth.repository';
import { UnauthorizedError } from '../../domain/errors';
import { AdminEntity } from '../../domain/admin';

describe('GetCurrentAdminUseCase', () => {
  let useCase: GetCurrentAdminUseCase;
  let repo: jest.Mocked<AuthRepository>;

  beforeEach(() => {
    const mock: jest.Mocked<AuthRepository> = {
      signIn: jest.fn(),
      signOut: jest.fn(),
      getCurrentAdmin: jest.fn(),
    } as jest.Mocked<AuthRepository>;

    const injector = Injector.create({
      providers: [
        { provide: GetCurrentAdminUseCase, useClass: GetCurrentAdminUseCase },
        { provide: AuthRepository, useValue: mock },
      ],
    });

    useCase = injector.get(GetCurrentAdminUseCase);
    repo = mock;
  });

  it('delegates to AuthRepository.getCurrentAdmin', (done) => {
    const admin: AdminEntity = { id: '42', email: 'admin@example.com', name: 'Admin', role: 'admin' };
    repo.getCurrentAdmin.mockReturnValue(of(admin));

    useCase.execute().subscribe({
      next: (result) => {
        expect(result).toBe(admin);
        expect(repo.getCurrentAdmin).toHaveBeenCalledTimes(1);
        (done as () => void)();
      },
    });
  });

  it('propagates UnauthorizedError from repository', (done) => {
    const err = new UnauthorizedError();
    repo.getCurrentAdmin.mockReturnValue(throwError(() => err));

    useCase.execute().subscribe({
      error: (caught) => {
        expect(caught).toBe(err);
        (done as () => void)();
      },
    });
  });
});
