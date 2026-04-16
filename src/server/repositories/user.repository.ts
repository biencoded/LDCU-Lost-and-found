import { getPool } from '../database';
import { DbUserRow } from '../types';

/**
 * Repository pattern for User data access
 * Isolates database queries from business logic
 */
export class UserRepository {
  /**
   * Find user by username and role
   */
  static async findByUsernameAndRole(
    username: string,
    role: 'admin' | 'user'
  ): Promise<DbUserRow | null> {
    const pool = getPool();
    const [rows] = await pool.execute<DbUserRow[]>(
      `SELECT * FROM users WHERE username = ? AND role = ? LIMIT 1`,
      [username, role]
    );
    return rows[0] || null;
  }

  /**
   * Find user by username (any role)
   */
  static async findByUsername(username: string): Promise<DbUserRow | null> {
    const pool = getPool();
    const [rows] = await pool.execute<DbUserRow[]>(
      `SELECT * FROM users WHERE username = ? LIMIT 1`,
      [username]
    );
    return rows[0] || null;
  }

  /**
   * Create a new user
   */
  static async create(username: string, hashedPassword: string): Promise<number> {
    const pool = getPool();
    const result = await pool.execute<any>(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );
    return result[0].insertId;
  }

  /**
   * List all users (admin only)
   */
  static async listAll(): Promise<DbUserRow[]> {
    const pool = getPool();
    const [rows] = await pool.execute<DbUserRow[]>(
      'SELECT id, username, role, created_at FROM users ORDER BY created_at DESC'
    );
    return rows;
  }
}
