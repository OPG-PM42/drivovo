import { Injectable, signal, computed } from '@angular/core';
import { AdminPublicView } from '../../domain/admin';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly _admin = signal<AdminPublicView | null>(null);
  private readonly _loading = signal(false);

  readonly admin = computed(() => this._admin());
  readonly isAuthenticated = computed(() => this._admin() !== null);
  readonly loading = computed(() => this._loading());

  /** @internal — only AuthFacade may call this. ESLint enforcement comes in Phase 7. */
  setAdmin(admin: AdminPublicView | null): void {
    this._admin.set(admin);
  }

  /** @internal — only AuthFacade may call this. ESLint enforcement comes in Phase 7. */
  setLoading(loading: boolean): void {
    this._loading.set(loading);
  }
}
