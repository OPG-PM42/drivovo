import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, lastValueFrom } from 'rxjs';
import { HttpAuthRepository } from './http-auth.repository';
import { AUTH_ME_PATH } from '../../http/auth-paths';
import type { AdminEntity } from '../../../domain/admin';

const mockAdmin: AdminEntity = { id: '1', email: 'admin@test.com' } as AdminEntity;

function makeRepo(): { repo: HttpAuthRepository; http: jest.Mocked<Pick<HttpClient, 'get' | 'post'>> } {
  const http = {
    get: jest.fn(),
    post: jest.fn(),
  } as unknown as jest.Mocked<Pick<HttpClient, 'get' | 'post'>>;

  const injector = Injector.create({
    providers: [
      { provide: HttpAuthRepository, useClass: HttpAuthRepository },
      { provide: HttpClient, useValue: http },
    ],
  });

  return { repo: injector.get(HttpAuthRepository), http: http as any };
}

describe('HttpAuthRepository', () => {
  let repo: HttpAuthRepository;
  let http: jest.Mocked<Pick<HttpClient, 'get' | 'post'>>;

  beforeEach(() => {
    ({ repo, http } = makeRepo());
  });

  it('signIn: POSTs to /auth/sign-in with credentials and returns admin', async () => {
    (http.post as jest.Mock).mockReturnValue(of(mockAdmin));
    const result = await lastValueFrom(repo.signIn('admin@test.com', 'secret'));
    expect(http.post).toHaveBeenCalledWith('/auth/sign-in', { email: 'admin@test.com', password: 'secret' });
    expect(result).toEqual(mockAdmin);
  });

  it('signOut: POSTs to /auth/sign-out with empty body', async () => {
    (http.post as jest.Mock).mockReturnValue(of(undefined));
    await lastValueFrom(repo.signOut());
    expect(http.post).toHaveBeenCalledWith('/auth/sign-out', {});
  });

  it('getCurrentAdmin: GETs AUTH_ME_PATH and returns admin', async () => {
    (http.get as jest.Mock).mockReturnValue(of(mockAdmin));
    const result = await lastValueFrom(repo.getCurrentAdmin());
    expect(http.get).toHaveBeenCalledWith(AUTH_ME_PATH);
    expect(result).toEqual(mockAdmin);
  });
});
