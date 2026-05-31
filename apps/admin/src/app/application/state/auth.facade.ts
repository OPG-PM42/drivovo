import { Injectable, inject, Signal } from '@angular/core';
import { EMPTY, Observable, finalize, shareReplay, tap } from 'rxjs';
import { AdminPublicView } from '../../domain/admin';
import { AuthStore } from './auth.store';
import { SignInUseCase } from '../use-cases/sign-in.use-case';
import { SignOutUseCase } from '../use-cases/sign-out.use-case';
import { GetCurrentAdminUseCase } from '../use-cases/get-current-admin.use-case';

/**
 * Single entry-point for auth orchestration from presentation.
 * Use-cases stay pure pass-through; AuthStore stays internal to application/state.
 *
 * Invariants:
 * - signIn: writes store via tap on success.
 * - signOut: resets store regardless of HTTP outcome (via finalize). Idempotent under parallel calls.
 * - signOutLocal: sync, no HTTP, early-return when admin() is already null.
 * - loadCurrent: dedupes parallel subscribers via shareReplay({bufferSize:1, refCount:false}).
 *   An internal lifecycle subscriber resets `loadCurrent$` to undefined on complete/error,
 *   so sequential calls after the previous request finished issue a fresh HTTP request.
 *   (finalize on a shareReplay observable would not fire with refCount:false, hence
 *   the explicit subscribe.)
 *   Owner: only auth.guard should call loadCurrent during bootstrap.
 */
@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly store = inject(AuthStore);
  private readonly signInUC = inject(SignInUseCase);
  private readonly signOutUC = inject(SignOutUseCase);
  private readonly loadUC = inject(GetCurrentAdminUseCase);

  private isSigningOut = false;
  private loadCurrent$?: Observable<AdminPublicView>;

  readonly admin: Signal<AdminPublicView | null> = this.store.admin;
  readonly isAuthenticated: Signal<boolean> = this.store.isAuthenticated;
  readonly loading: Signal<boolean> = this.store.loading;

  signIn(email: string, password: string): Observable<AdminPublicView> {
    return this.signInUC.execute(email, password).pipe(
      tap((admin) => this.store.setAdmin(admin)),
    );
  }

  signOut(): Observable<void> {
    if (this.isSigningOut) return EMPTY;
    this.isSigningOut = true;
    return this.signOutUC.execute().pipe(
      finalize(() => {
        this.store.setAdmin(null);
        this.isSigningOut = false;
      }),
    );
  }

  signOutLocal(): void {
    if (this.store.admin() === null) return;
    this.store.setAdmin(null);
  }

  loadCurrent(): Observable<AdminPublicView> {
    if (!this.loadCurrent$) {
      this.loadCurrent$ = this.loadUC.execute().pipe(
        tap((admin) => this.store.setAdmin(admin)),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
      this.loadCurrent$.subscribe({
        error: () => { this.loadCurrent$ = undefined; },
        complete: () => { this.loadCurrent$ = undefined; },
      });
    }
    return this.loadCurrent$;
  }
}
