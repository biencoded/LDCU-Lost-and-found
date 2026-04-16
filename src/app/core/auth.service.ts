import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { LoginDto, RegisterDto, LoginResponse } from '../shared/types';

/**
 * Authentication Service
 * Manages user authentication state and API calls
 * Located in core as it's a singleton shared across the app
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly api = inject(ApiService);

  // Signals for reactive state
  isAuthenticated = signal(false);
  currentUser = signal<{ username: string; role: 'admin' | 'user' } | null>(null);
  token = signal<string | null>(null);

  constructor() {
    // Load from localStorage on init
    this.loadFromStorage();
  }

  /**
   * Login with credentials
   */
  login(credentials: LoginDto) {
    return this.api.post<LoginResponse>('/auth/login', credentials);
  }

  /**
   * Register new user
   */
  register(data: RegisterDto) {
    return this.api.post<{ message: string }>('/auth/register', data);
  }

  /**
   * Store auth data after successful login
   */
  setAuthData(response: LoginResponse): void {
    this.token.set(response.token);
    this.currentUser.set(response.user);
    this.isAuthenticated.set(true);
    this.saveToStorage();
  }

  /**
   * Clear auth data on logout
   */
  logout(): void {
    this.token.set(null);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.clearStorage();
  }

  /**
   * Save auth to localStorage
   */
  private saveToStorage(): void {
    if (this.token()) {
      localStorage.setItem('auth_token', this.token()!);
    }
    if (this.currentUser()) {
      localStorage.setItem('current_user', JSON.stringify(this.currentUser()));
    }
  }

  /**
   * Load auth from localStorage
   */
  private loadFromStorage(): void {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('current_user');

    if (token && user) {
      this.token.set(token);
      this.currentUser.set(JSON.parse(user));
      this.isAuthenticated.set(true);
    }
  }

  /**
   * Clear localStorage
   */
  private clearStorage(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
  }
}
