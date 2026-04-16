import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { CreateItemDto, UpdateItemStatusDto, LostItemResponse, StatsResponse } from '../shared/types';

/**
 * Item Service
 * Manages all lost item related API calls and state
 * Located in core as it's used across features
 */
@Injectable({
  providedIn: 'root',
})
export class ItemService {
  private readonly api = inject(ApiService);

  /**
   * Get all items
   */
  getAllItems() {
    return this.api.get<LostItemResponse[]>('/items');
  }

  /**
   * Get item by ID
   */
  getItemById(id: number) {
    return this.api.get<LostItemResponse>(`/items/${id}`);
  }

  /**
   * Search items by status
   */
  searchByStatus(status: 'pending' | 'found' | 'claimed') {
    return this.api.get<LostItemResponse[]>(`/items/search?status=${status}`);
  }

  /**
   * Create new item
   */
  createItem(data: CreateItemDto) {
    return this.api.post<LostItemResponse>('/items', data);
  }

  /**
   * Update item status
   */
  updateItemStatus(id: number, data: UpdateItemStatusDto) {
    return this.api.put<LostItemResponse>(`/items/${id}`, data);
  }

  /**
   * Delete item
   */
  deleteItem(id: number) {
    return this.api.delete<{ message: string }>(`/items/${id}`);
  }

  /**
   * Get statistics
   */
  getStats() {
    return this.api.get<StatsResponse>('/stats');
  }
}
