import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Injector, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AdminErrorHandler } from './error-handler';
import { AuthFacade } from '../application/state/auth.facade';
import { ApiError, UnauthorizedError } from '../domain/errors';

describe('AdminErrorHandler', () => {
  let handler: AdminErrorHandler;
  let facade: jest.Mocked<Pick<AuthFacade, 'signOutLocal'>>;
  let router: jest.Mocked<Pick<Router, 'navigate'>>;

  beforeEach(() => {
    facade = { signOutLocal: jest.fn() } as any;
    router = { navigate: jest.fn().mockResolvedValue(true) } as any;
    const ngZone = { run: jest.fn((fn: () => void) => fn()) } as any;

    const injector = Injector.create({
      providers: [
        { provide: AdminErrorHandler, useClass: AdminErrorHandler },
        { provide: NgZone, useValue: ngZone },
        { provide: Router, useValue: router },
        { provide: AuthFacade, useValue: facade },
      ],
    });

    handler = injector.get(AdminErrorHandler);
  });

  it('on UnauthorizedError: calls signOutLocal and navigate to /login', () => {
    handler.handleError(new UnauthorizedError());
    expect(facade.signOutLocal).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('on other errors: does not call signOutLocal or navigate', () => {
    handler.handleError(new ApiError(500, 'Internal Server Error'));
    expect(facade.signOutLocal).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
