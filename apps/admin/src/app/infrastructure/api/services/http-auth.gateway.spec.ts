import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Injector } from '@angular/core';
import { of, lastValueFrom } from 'rxjs';
import { HttpAuthGateway } from './http-auth.gateway';
import { AdminAuthService } from '../generated';
import type { AdminPublicView as GeneratedAdminPublicView } from '../generated';

const isoDate = '2024-01-01T00:00:00.000Z';
const mockGeneratedAdmin: GeneratedAdminPublicView = {
  id: '1',
  email: 'admin@test.com',
  name: 'Admin',
  role: 'admin',
  createdAt: isoDate,
  updatedAt: isoDate,
};

function makeGateway(): {
  gateway: HttpAuthGateway;
  api: jest.Mocked<Pick<AdminAuthService, 'signIn' | 'signOut' | 'getCurrentAdmin'>>;
} {
  const api = {
    signIn: jest.fn(),
    signOut: jest.fn(),
    getCurrentAdmin: jest.fn(),
  } as unknown as jest.Mocked<Pick<AdminAuthService, 'signIn' | 'signOut' | 'getCurrentAdmin'>>;

  const injector = Injector.create({
    providers: [
      { provide: HttpAuthGateway, useClass: HttpAuthGateway },
      { provide: AdminAuthService, useValue: api },
    ],
  });

  return { gateway: injector.get(HttpAuthGateway), api: api as any };
}

describe('HttpAuthGateway', () => {
  let gateway: HttpAuthGateway;
  let api: jest.Mocked<Pick<AdminAuthService, 'signIn' | 'signOut' | 'getCurrentAdmin'>>;

  beforeEach(() => {
    ({ gateway, api } = makeGateway());
  });

  it('signIn: constructs SignInRequest and delegates to AdminAuthService.signIn', async () => {
    (api.signIn as jest.Mock).mockReturnValue(of(mockGeneratedAdmin));
    const result = await lastValueFrom(gateway.signIn('admin@test.com', 'secret'));
    expect(api.signIn).toHaveBeenCalledWith({ email: 'admin@test.com', password: 'secret' });
    expect(result.id).toBe('1');
    expect(result.createdAt).toBeInstanceOf(Date);
  });

  it('signOut: delegates to AdminAuthService.signOut and maps SuccessResponse → void', async () => {
    (api.signOut as jest.Mock).mockReturnValue(of({ success: true }));
    const result = await lastValueFrom(gateway.signOut());
    expect(api.signOut).toHaveBeenCalledTimes(1);
    expect(result).toBeUndefined();
  });

  it('getCurrentAdmin: delegates and maps DTO → domain', async () => {
    (api.getCurrentAdmin as jest.Mock).mockReturnValue(of(mockGeneratedAdmin));
    const result = await lastValueFrom(gateway.getCurrentAdmin());
    expect(api.getCurrentAdmin).toHaveBeenCalledTimes(1);
    expect(result.id).toBe('1');
    expect(result.email).toBe('admin@test.com');
    expect(result.createdAt).toBeInstanceOf(Date);
  });
});
