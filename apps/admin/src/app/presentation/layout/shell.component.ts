import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthStore } from '../../infrastructure/state/auth.store';
import { SignOutUseCase } from '../../application/use-cases/sign-out.use-case';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav mode="side" opened class="sidenav">
        <mat-nav-list>
          <a mat-list-item routerLink="/cars">
            <mat-icon matListItemIcon>directions_car</mat-icon>
            <span matListItemTitle>Cars</span>
          </a>
          <a mat-list-item routerLink="/tariffs">
            <mat-icon matListItemIcon>receipt_long</mat-icon>
            <span matListItemTitle>Tariffs</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <span class="spacer"></span>
          @if (authStore.admin(); as admin) {
            <span class="admin-name">{{ admin.name }}</span>
          }
          <button mat-icon-button (click)="onSignOut()" title="Sign out">
            <mat-icon>logout</mat-icon>
          </button>
        </mat-toolbar>

        <div class="content">
          <router-outlet />
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: `
    .sidenav-container { height: 100vh; }
    .sidenav { width: 220px; }
    .spacer { flex: 1 1 auto; }
    .admin-name { margin-right: 8px; font-size: 14px; }
    .content { padding: 24px; }
  `,
})
export class ShellComponent {
  readonly authStore = inject(AuthStore);
  private readonly signOut = inject(SignOutUseCase);
  private readonly router = inject(Router);

  onSignOut(): void {
    this.signOut.execute().subscribe({
      complete: () => {
        this.authStore.setAdmin(null);
        this.router.navigate(['/login']);
      },
    });
  }
}
