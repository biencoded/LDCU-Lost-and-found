import { getPool } from '../database';
import { DbLostItemRow, StatsResponse } from '../types';

/**
 * Repository pattern for LostItem data access
 * Isolates database queries from business logic
 */
export class ItemRepository {
  /**
   * Get all items
   */
  static async findAll(): Promise<DbLostItemRow[]> {
    const pool = getPool();
    const [rows] = await pool.execute<DbLostItemRow[]>(
      'SELECT * FROM lost_items ORDER BY created_at DESC'
    );
    return rows;
  }

  /**
   * Get item by ID
   */
  static async findById(id: number): Promise<DbLostItemRow | null> {
    const pool = getPool();
    const [rows] = await pool.execute<DbLostItemRow[]>(
      'SELECT * FROM lost_items WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Get items by status
   */
  static async findByStatus(status: 'pending' | 'found' | 'claimed'): Promise<DbLostItemRow[]> {
    const pool = getPool();
    const [rows] = await pool.execute<DbLostItemRow[]>(
      'SELECT * FROM lost_items WHERE status = ? ORDER BY created_at DESC',
      [status]
    );
    return rows;
  }

  /**
   * Create new lost item
   */
  static async create(item_name: string, description: string): Promise<number> {
    const pool = getPool();
    const result = await pool.execute<any>(
      'INSERT INTO lost_items (item_name, description) VALUES (?, ?)',
      [item_name, description]
    );
    return result[0].insertId;
  }

  /**
   * Update item status
   */
  static async updateStatus(id: number, status: 'pending' | 'found' | 'claimed'): Promise<boolean> {
    const pool = getPool();
    const result = await pool.execute<any>(
      'UPDATE lost_items SET status = ? WHERE id = ?',
      [status, id]
    );
    return result[0].affectedRows > 0;
  }

  /**
   * Delete item
   */
  static async delete(id: number): Promise<boolean> {
    const pool = getPool();
    const result = await pool.execute<any>(
      'DELETE FROM lost_items WHERE id = ?',
      [id]
    );
    return result[0].affectedRows > 0;
  }

  /**
   * Get statistics about items
   */
  static async getStats(): Promise<StatsResponse> {
    const pool = getPool();
    const [rows] = await pool.execute<any[]>(
      `SELECT 
        COUNT(*) as total_items,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_items,
        SUM(CASE WHEN status = 'found' THEN 1 ELSE 0 END) as found_items,
        SUM(CASE WHEN status = 'claimed' THEN 1 ELSE 0 END) as claimed_items
      FROM lost_items`
    );
    return {
      total_items: rows[0].total_items || 0,
      pending_items: rows[0].pending_items || 0,
      found_items: rows[0].found_items || 0,
      claimed_items: rows[0].claimed_items || 0,
    };
  }
}
