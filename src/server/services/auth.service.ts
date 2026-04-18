import bcrypt from 'bcryptjs';
import { securityConfig } from '../config';
import { UserRepository } from '../repositories/user.repository';
import { LoginDto, RegisterDto } from '../types';

/**
 * Service for authentication business logic
 * Handles validation, password hashing, and user authentication
 */
export class AuthService {
  /**
   * Authenticate user with credentials
   * Returns user info (without password)
   */
  static async login(dto: LoginDto): Promise<{
    id: number;
    username: string;
    name: string;
    role: 'admin' | 'user';
  }> {
    // Validate input
    if (!dto.username || !dto.password) {
      throw new Error('Username and password required');
    }

    if (dto.username.length < 3) {
      throw new Error('Username too short');
    }

    if (dto.password.length < 4) {
      throw new Error('Password too short');
    }

    // Find user by username
    const user = await UserRepository.findByUsername(dto.username);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    return {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    };
  }

  /**
   * Register new user
   */
  static async register(dto: RegisterDto): Promise<{ message: string }> {
    // Validate input
    if (!dto.username || !dto.password || !dto.name) {
      throw new Error('All fields required (username, name, password)');
    }

    if (dto.username.length < 3) {
      throw new Error('Username must be at least 3 characters');
    }

    if (dto.name.length < 2) {
      throw new Error('Name must be at least 2 characters');
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
    await UserRepository.create(dto.username, dto.name, hashedPassword);

    return { message: 'User registered successfully. You can now log in.' };
  }
}
