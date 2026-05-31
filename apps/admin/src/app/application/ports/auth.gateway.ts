import { Observable } from 'rxjs';
import { AdminPublicView } from '../../domain/admin';

export abstract class AuthGateway {
  abstract signIn(email: string, password: string): Observable<AdminPublicView>;
  abstract signOut(): Observable<void>;
  abstract getCurrentAdmin(): Observable<AdminPublicView>;
}
