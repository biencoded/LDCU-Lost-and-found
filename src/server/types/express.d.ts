import 'express-session';
import { AuthUser } from '../types';

declare module 'express-session' {
  interface Session {
    user?: {
      id: number;
      username: string;
      name: string;
      role: 'admin' | 'user';
    };
  }
}
