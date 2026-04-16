import bcrypt from 'bcryptjs';
import { securityConfig } from '../config';
import { UserRepository } from '../repositories/user.repository';
import { LoginDto, RegisterDto, UserResponse, LoginResponse } from '../types';

/**
 * Service for authentication business logic
 * Handles validation, password hashing, and user authentication
 */
export class AuthService {
  /**
   * Authenticate user with credentials
   */
  static async login(dto: LoginDto): Promise<LoginResponse> {
    // Validate input
    if (!dto.username || !dto.password || !dto.role) {
      throw new Error('All fields required');
    }

    if (dto.username.length < 3) {
      throw new Error('Username too short');
    }

    if (dto.password.length < 4) {
      throw new Error('Password too short');
    }

    // Find user
    const user = await UserRepository.findByUsernameAndRole(dto.username, dto.role);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate token (simplified - use JWT in production)
    const token = this.generateToken(user.id, user.username, user.role);

    return {
      token,
      user: {
        username: user.username,
        role: user.role,
      },
    };
  }

  /**
   * Register new user
   */
  static async register(dto: RegisterDto): Promise<{ message: string }> {
    // Validate input
    if (!dto.username || !dto.password) {
      throw new Error('Required fields missing');
    }

    if (dto.username.length < 3) {
      throw new Error('Username must be at least 3 characters');
    }

    if (dto.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Check if user exists
    const existing = await UserRepository.findByUsername(dto.username);
    if (existing) {
      throw new Error('Username already taken');
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(dto.password, securityConfig.bcryptRounds);

    // Create user
    await UserRepository.create(dto.username, hashedPassword);

    return { message: 'User created successfully' };
  }

  /**
   * Generate auth token (simplified)
   * TODO: Use JWT in production
   */
  private static generateToken(id: number, username: string, role: string): string {
    // In production, use JWT
    return `token-${id}-${username}-${role}-${Date.now()}`;
  }
}
