import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, switchMap, of, BehaviorSubject } from 'rxjs';
import { RegisterDto } from '../shared/types';
import { SessionResponse, SessionUser, AuthUser } from './session.types';

interface LoginResponse {
  message: string;
  user: {
    username: string;
    name: string;
    role: 'admin' | 'user';
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storageKey = 'ldcuUser';
  private readonly apiUrl = '/api/auth';

  private readonly currentUserSignal = signal<AuthUser | null>(null);
  readonly currentUser = this.currentUserSignal;
  readonly isAuthenticated = computed(() => !!this.currentUserSignal());

  private readonly sessionCheckSubject = new BehaviorSubject<boolean>(false);
  readonly sessionChecking = this.sessionCheckSubject.asObservable();

  constructor() {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem(this.storageKey);
      if (saved) {
        try {
          const user = JSON.parse(saved) as AuthUser;
          this.currentUserSignal.set(user);
        } catch {
          this.currentUserSignal.set(null);
        }
      }
    }
    // Check session on init
    this.checkSession();
  }

  login(username: string, password: string, role: 'admin' | 'user'): Observable<LoginResponse> {
    const payload = { username, password }; // Backend doesn't use role
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, payload, {withCredentials: true})
      .pipe(
        tap((response) => {
          const user: AuthUser = {
            username: response.user.username,
            role: response.user.role as 'admin' | 'user'
          };
          this.setCurrentUser(user);
        })
      );
  }

  register(data: RegisterDto): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, data, {withCredentials: true});
  }

  checkSession(): Observable<SessionResponse> {
    this.sessionCheckSubject.next(true);
    return this.http.get<SessionResponse>(`${this.apiUrl}/session`, {withCredentials: true}).pipe(
      tap((response) => {
        if (response.authenticated && response.user) {
          const user: AuthUser = {
            username: response.user.username,
            role: response.user.role as 'admin' | 'user'
          };
          this.setCurrentUser(user);
        } else {
          this.logout();
        }
        this.sessionCheckSubject.next(false);
      })
    );
  }

  logout() {
    this.http.post(`${this.apiUrl}/logout`, {}, {withCredentials: true}).subscribe({
      error: (err) => {} // Ignore logout errors
    });
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(this.storageKey);
    }
    this.currentUserSignal.set(null);
  }

  private setCurrentUser(user: AuthUser): void {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(this.storageKey, JSON.stringify(user));
    }
    this.currentUserSignal.set(user);
  }
}
