import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Injector, signal } from '@angular/core';
import { of, Subject } from 'rxjs';
import { AuthFacade } from './auth.facade';
import { AuthStore } from './auth.store';
import { AuthUseCase } from '../use-cases/auth.use-case';
import { AdminPublicView } from '../../domain/admin';

describe('AuthFacade', () => {
  let facade: AuthFacade;
  let store: jest.Mocked<AuthStore>;
  let authUseCase: jest.Mocked<AuthUseCase>;

  const admin: AdminPublicView = { id: '1', email: 'a@b.c', name: 'A', role: 'admin', createdAt: new Date(0), updatedAt: new Date(0) };

  beforeEach(() => {
    const adminSig = signal<AdminPublicView | null>(null);
    store = {
      admin: adminSig,
      isAuthenticated: signal(false),
      loading: signal(false),
      setAdmin: jest.fn((a: AdminPublicView | null) => adminSig.set(a)),
      setLoading: jest.fn(),
    } as unknown as jest.Mocked<AuthStore>;

    authUseCase = {
      signIn: jest.fn(),
      signOut: jest.fn(),
      getCurrentAdmin: jest.fn(),
    } as unknown as jest.Mocked<AuthUseCase>;

    const injector = Injector.create({
      providers: [
        { provide: AuthStore, useValue: store },
        { provide: AuthUseCase, useValue: authUseCase },
        { provide: AuthFacade, useClass: AuthFacade },
      ],
    });
    facade = injector.get(AuthFacade);
  });

  it('signIn delegates and writes admin to store via tap', (done) => {
    authUseCase.signIn.mockReturnValue(of(admin));
    facade.signIn('a@b.c', 'pwd').subscribe({
      next: (a) => {
        expect(a).toBe(admin);
        expect(authUseCase.signIn).toHaveBeenCalledWith('a@b.c', 'pwd');
        expect(store.setAdmin).toHaveBeenCalledWith(admin);
        (done as () => void)();
      },
    });
  });

  it('signOut is idempotent under parallel calls (use-case invoked once)', (done) => {
    const subj = new Subject<void>();
    authUseCase.signOut.mockReturnValue(subj.asObservable());
    let completes = 0;
    const onComplete = () => {
      completes++;
      if (completes === 2) {
        // Use setTimeout(0) so finalize teardown has run before assertions
        setTimeout(() => {
          expect(authUseCase.signOut).toHaveBeenCalledTimes(1);
          expect(store.setAdmin).toHaveBeenCalledWith(null);
          expect(store.setAdmin).toHaveBeenCalledTimes(1);
          (done as () => void)();
        }, 0);
      }
    };

    facade.signOut().subscribe({ complete: onComplete });
    facade.signOut().subscribe({ complete: onComplete }); // second call returns EMPTY synchronously → completes immediately

    subj.next(); subj.complete();
  });

  it('signOutLocal early-returns when admin() is null', () => {
    facade.signOutLocal();
    expect(store.setAdmin).not.toHaveBeenCalled();
  });

  it('loadCurrent dedupes parallel subscribers (use-case invoked once)', (done) => {
    const subj = new Subject<AdminPublicView>();
    authUseCase.getCurrentAdmin.mockReturnValue(subj.asObservable());
    let received = 0;
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const next = () => { if (++received === 2) finish(); };

    facade.loadCurrent().subscribe({ next });
    facade.loadCurrent().subscribe({ next });

    subj.next(admin); subj.complete();

    function finish() {
      expect(authUseCase.getCurrentAdmin).toHaveBeenCalledTimes(1);
      expect(store.setAdmin).toHaveBeenCalledWith(admin);
      (done as () => void)();
    }
  });

  it('loadCurrent re-fetches after complete (manual reset works)', (done) => {
    const first = new Subject<AdminPublicView>();
    const second = new Subject<AdminPublicView>();
    authUseCase.getCurrentAdmin.mockReturnValueOnce(first.asObservable()).mockReturnValueOnce(second.asObservable());

    facade.loadCurrent().subscribe({
      complete: () => {
        // After complete, loadCurrent$ should be undefined again
        facade.loadCurrent().subscribe({
          complete: () => {
            expect(authUseCase.getCurrentAdmin).toHaveBeenCalledTimes(2);
            (done as () => void)();
          },
        });
        second.next(admin); second.complete();
      },
    });
    first.next(admin); first.complete();
  });
});
