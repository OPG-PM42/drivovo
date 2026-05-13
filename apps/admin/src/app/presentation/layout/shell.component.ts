import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TuiRoot, TuiButton, TuiIcon, TuiLink } from '@taiga-ui/core';
import { AuthFacade } from '../../application/state/auth.facade';

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
  readonly authFacade = inject(AuthFacade);
  private readonly router = inject(Router);

  onSignOut(): void {
    this.authFacade.signOut().subscribe({
      complete: () => this.router.navigate(['/login']),
    });
  }
}
