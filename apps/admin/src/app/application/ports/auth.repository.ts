import { Observable } from 'rxjs';
import { AdminEntity } from '../../domain/admin';

export abstract class AuthRepository {
  abstract signIn(email: string, password: string): Observable<AdminEntity>;
  abstract signOut(): Observable<void>;
  abstract getCurrentAdmin(): Observable<AdminEntity>;
}
