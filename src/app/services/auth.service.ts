import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface AuthUser {
  username: string;
  role: 'admin' | 'user';
}

interface AuthResponse {
  token: string;
  user: AuthUser;
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

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem(this.storageKey);
      if (saved) {
        try {
          this.currentUserSignal.set(JSON.parse(saved));
        } catch {
          this.currentUserSignal.set(null);
        }
      }
    }
  }

  login(username: string, password: string, role: 'admin' | 'user'): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, { username, password, role })
      .pipe(tap((response) => this.setCurrentUser(response.user)));
  }

  logout() {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(this.storageKey);
    }
    this.currentUserSignal.set(null);
  }

  register(username: string, password: string): Observable<{ user: AuthUser }> {
    return this.http.post<{ user: AuthUser }>(`${this.apiUrl}/register`, {
      username,
      password,
    });
  }

  private setCurrentUser(user: AuthUser): void {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(this.storageKey, JSON.stringify(user));
    }
    this.currentUserSignal.set(user);
  }
}
