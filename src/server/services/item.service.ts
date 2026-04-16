import { ItemRepository } from '../repositories/item.repository';
import { CreateItemDto, UpdateItemStatusDto, LostItemResponse, StatsResponse } from '../types';

/**
 * Service for lost item business logic
 * Handles validation and item management
 */
export class ItemService {
  /**
   * Get all items
   */
  static async getAllItems(): Promise<LostItemResponse[]> {
    const items = await ItemRepository.findAll();
    return items.map(this.normalizeItem);
  }

  /**
   * Get item by ID
   */
  static async getItemById(id: number): Promise<LostItemResponse> {
    const item = await ItemRepository.findById(id);
    if (!item) {
      throw new Error('Item not found');
    }
    return this.normalizeItem(item);
  }

  /**
   * Search items by status
   */
  static async searchByStatus(status: 'pending' | 'found' | 'claimed'): Promise<LostItemResponse[]> {
    const items = await ItemRepository.findByStatus(status);
    return items.map(this.normalizeItem);
  }

  /**
   * Create new item
   */
  static async createItem(dto: CreateItemDto): Promise<LostItemResponse> {
    // Validate input
    if (!dto.item_name || !dto.description) {
      throw new Error('item_name and description are required');
    }

    if (dto.item_name.trim().length < 3) {
      throw new Error('Item name must be at least 3 characters');
    }

    if (dto.description.trim().length < 10) {
      throw new Error('Description must be at least 10 characters');
    }

    // Create item
    const id = await ItemRepository.create(
      dto.item_name.trim(),
      dto.description.trim()
    );

    // Return created item
    const item = await ItemRepository.findById(id);
    if (!item) {
      throw new Error('Failed to create item');
    }

    return this.normalizeItem(item);
  }

  /**
   * Update item status
   */
  static async updateItemStatus(id: number, dto: UpdateItemStatusDto): Promise<LostItemResponse> {
    // Validate input
    const validStatuses = ['pending', 'found', 'claimed'];
    if (!validStatuses.includes(dto.status)) {
      throw new Error('Invalid status. Must be: pending, found, or claimed');
    }

    // Check item exists
    const item = await ItemRepository.findById(id);
    if (!item) {
      throw new Error('Item not found');
    }

    // Update status
    await ItemRepository.updateStatus(id, dto.status);

    // Return updated item
    const updated = await ItemRepository.findById(id);
    if (!updated) {
      throw new Error('Failed to update item');
    }

    return this.normalizeItem(updated);
  }

  /**
   * Delete item
   */
  static async deleteItem(id: number): Promise<{ message: string }> {
    // Check item exists
    const item = await ItemRepository.findById(id);
    if (!item) {
      throw new Error('Item not found');
    }

    // Delete item
    await ItemRepository.delete(id);

    return { message: 'Item deleted successfully' };
  }

  /**
   * Get statistics
   */
  static async getStats(): Promise<StatsResponse> {
    return ItemRepository.getStats();
  }

  /**
   * Normalize database row to API response
   */
  private static normalizeItem(item: any): LostItemResponse {
    return {
      id: item.id,
      item_name: item.item_name,
      description: item.description,
      status: item.status,
      created_at: item.created_at,
    };
  }
}
