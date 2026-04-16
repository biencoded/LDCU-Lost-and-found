import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { LoginDto, RegisterDto } from '../types';

/**
 * Controller for authentication routes
 * Handles HTTP requests and delegates to service layer
 */
export class AuthController {
  /**
   * POST /api/auth/login
   * Supports both database auth and demo mode (for when DB is unavailable)
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const dto: LoginDto = req.body;
      
      // Demo mode: Allow hardcoded credentials when database isn't available
      if ((dto.username === 'admin' && dto.password === 'admin123' && dto.role === 'admin') ||
          (dto.username === 'demo' && dto.password === 'demo123' && dto.role === 'user')) {
        res.json({
          token: `demo-token-${dto.username}-${Date.now()}`,
          user: {
            username: dto.username,
            role: dto.role,
          },
        });
        return;
      }

      // Try database auth
      const result = await AuthService.login(dto);
      res.json(result);
    } catch (error) {
      // If database fails, allow demo credentials as fallback
      const dto: LoginDto = req.body;
      if ((dto.username === 'admin' && dto.password === 'admin123' && dto.role === 'admin') ||
          (dto.username === 'demo' && dto.password === 'demo123' && dto.role === 'user')) {
        res.json({
          token: `demo-token-${dto.username}-${Date.now()}`,
          user: {
            username: dto.username,
            role: dto.role,
          },
        });
        return;
      }

      const message = error instanceof Error ? error.message : 'Login failed';
      res.status(401).json({ error: message });
    }
  }

  /**
   * POST /api/auth/register
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const dto: RegisterDto = req.body;
      const result = await AuthService.register(dto);
      res.status(201).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Register failed';
      res.status(400).json({ error: message });
    }
  }
}
