import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TuiDialogService } from '@taiga-ui/core';
import { TUI_CONFIRM, type TuiConfirmData } from '@taiga-ui/kit';

export interface ConfirmDialogOptions {
  readonly title: string;
  readonly message: string;
  readonly confirmLabel?: string;
  readonly cancelLabel?: string;
  readonly size?: 's' | 'm' | 'l';
}

/**
 * Permanent application-layer abstraction over Taiga's TUI_CONFIRM.
 * Callers depend on Observable<boolean> only; the service hides
 * TuiDialogService, TUI_CONFIRM token, and TuiConfirmData shape.
 *
 * Dismissal (Esc / backdrop) completes the observable without emitting,
 * so callers' `subscribe(confirmed => { if (confirmed) ... })` is
 * naturally safe — destructive actions only run on explicit "yes".
 */
@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly dialogs = inject(TuiDialogService);

  confirm(options: ConfirmDialogOptions): Observable<boolean> {
    return this.dialogs.open<boolean>(TUI_CONFIRM, {
      label: options.title,
      size: options.size ?? 's',
      data: {
        content: options.message,
        yes: options.confirmLabel ?? 'Confirm',
        no: options.cancelLabel ?? 'Cancel',
      } satisfies TuiConfirmData,
    });
  }
}
