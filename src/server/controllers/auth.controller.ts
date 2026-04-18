import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { LoginDto, RegisterDto } from '../types';

/**
 * Controller for authentication routes
 * Uses session-based authentication with httpOnly cookies
 */
export class AuthController {
  /**
   * POST /api/auth/register
   * Register a new user
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const dto: RegisterDto = req.body;
      const result = await AuthService.register(dto);
      res.status(201).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      res.status(400).json({ error: message });
    }
  }

  /**
   * POST /api/auth/login
   * Authenticate user and create session
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const dto: LoginDto = req.body;
      const user = await AuthService.login(dto);

      // Set user in session (httpOnly cookie is automatically set by express-session)
      req.session.user = {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      };

      res.json({
        message: 'Login successful',
        user: {
          username: user.username,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      res.status(401).json({ error: message });
    }
  }

  /**
   * POST /api/auth/logout
   * Destroy session
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      req.session.destroy((err) => {
        if (err) {
          res.status(500).json({ error: 'Logout failed' });
          return;
        }
        res.clearCookie('connect.sid'); // Clear session cookie
        res.json({ message: 'Logout successful' });
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed';
      res.status(400).json({ error: message });
    }
  }

  /**
   * GET /api/auth/session
   * Get current session user info
   */
  static async getSession(req: Request, res: Response): Promise<void> {
    try {
      if (req.session.user) {
        res.json({
          authenticated: true,
          user: req.session.user,
        });
      } else {
        res.json({
          authenticated: false,
          user: null,
        });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to get session' });
    }
  }
}
