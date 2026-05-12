import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TuiRoot, TuiButton, TuiIcon, TuiLink } from '@taiga-ui/core';
import { AuthStore } from '../../infrastructure/state/auth.store';
import { SignOutUseCase } from '../../application/use-cases/sign-out.use-case';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    TuiRoot,
    TuiButton,
    TuiIcon,
    TuiLink,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
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
