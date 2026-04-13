import { Injectable, computed, signal } from '@angular/core';

export interface AuthUser {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'student';
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly storageKey = 'ldcuUser';
  private readonly usersKey = 'ldcuUsers';

  private readonly currentUserSignal = signal<AuthUser | null>(null);
  readonly currentUser = this.currentUserSignal;
  readonly isAuthenticated = computed(() => !!this.currentUserSignal());

  private readonly defaultUsers: AuthUser[] = [
    {
      name: 'Administrator',
      email: 'admin@ldcu.edu.ph',
      password: 'admin123',
      role: 'admin',
    },
    {
      name: 'Student User',
      email: 'student@ldcu.edu.ph',
      password: 'student123',
      role: 'student',
    },
  ];

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

  private loadRegisteredUsers(): AuthUser[] {
    if (typeof window === 'undefined') {
      return [...this.defaultUsers];
    }

    const saved = window.localStorage.getItem(this.usersKey);
    if (!saved) {
      return [...this.defaultUsers];
    }

    try {
      const parsed = JSON.parse(saved) as AuthUser[];
      return [...this.defaultUsers, ...parsed];
    } catch {
      return [...this.defaultUsers];
    }
  }

  private saveRegisteredUsers(users: AuthUser[]): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(this.usersKey, JSON.stringify(users));
  }

  login(email: string, password: string, role: 'admin' | 'student') {
    if (!email || !password || !role) {
      return { success: false, error: 'Email, password, and role are required.' } as const;
    }

    const users = this.loadRegisteredUsers();
    const found = users.find(
      (user) => user.email === email && user.password === password && user.role === role,
    );

    if (!found) {
      return { success: false, error: 'Invalid credentials. Please try again.' } as const;
    }

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(this.storageKey, JSON.stringify(found));
    }

    this.currentUserSignal.set(found);
    return { success: true, user: found } as const;
  }

  logout() {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(this.storageKey);
    }
    this.currentUserSignal.set(null);
  }

  register(name: string, email: string, password: string, role: 'admin' | 'student') {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPassword || !role) {
      return { success: false, error: 'Please fill in all registration fields.' } as const;
    }

    const users = this.loadRegisteredUsers();
    const existing = users.find((user) => user.email === trimmedEmail);
    if (existing) {
      return { success: false, error: 'That email is already registered.' } as const;
    }

    const newUser: AuthUser = {
      name: trimmedName,
      email: trimmedEmail,
      password: trimmedPassword,
      role,
    };

    const extraUsers = users.filter((user) =>
      !this.defaultUsers.some((defaultUser) => defaultUser.email === user.email),
    );
    extraUsers.push(newUser);
    this.saveRegisteredUsers(extraUsers);

    return { success: true, user: newUser } as const;
  }
}
