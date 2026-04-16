import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LostFoundItem {
  id: number;
  item_name: string;
  description: string;
  status: 'pending' | 'found' | 'claimed';
  photo?: string;
  title?: string;
  category?: string;
  location?: string;
  date?: string;
}

export interface CreateItemDto {
  item_name: string;
  description: string;
  photo?: string;
  title?: string;
  category?: string;
  location?: string;
  date?: string;
}

export interface UpdateItemDto {
  item_name?: string;
  description?: string;
  status?: 'pending' | 'found' | 'claimed';
}

@Injectable({
  providedIn: 'root'
})
export class LostItemService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/items';

  getItems(filters?: {
    status?: string;
    q?: string;
  }): Observable<LostFoundItem[]> {
    let url = this.apiUrl;
    const params = new URLSearchParams();

    if (filters?.status) params.append('status', filters.status);
    if (filters?.q) params.append('q', filters.q);

    if (params.toString()) {
      url += '?' + params.toString();
    }

    return this.http.get<LostFoundItem[]>(url);
  }

  getItemById(id: number): Observable<LostFoundItem> {
    return this.http.get<LostFoundItem>(`${this.apiUrl}/${id}`);
  }

  createItem(item: CreateItemDto): Observable<LostFoundItem> {
    return this.http.post<LostFoundItem>(this.apiUrl, item);
  }

  updateItem(id: number, updates: UpdateItemDto): Observable<LostFoundItem> {
    return this.http.put<LostFoundItem>(`${this.apiUrl}/${id}`, updates);
  }

  deleteItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
