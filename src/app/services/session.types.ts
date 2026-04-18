export interface SessionResponse {
  authenticated: boolean;
  user: SessionUser | null;
}

export interface SessionUser {
  id: number;
  username: string;
  name: string;
  role: 'admin' | 'user';
}

export interface AuthUser {
  username: string;
  role: 'admin' | 'user';
}

