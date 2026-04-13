import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LostFoundItem {
  id: number;
  title: string;
  description: string;
  category: 'Lost' | 'Found';
  location: string;
  date: string;
  status: 'open' | 'claimed';
}

export interface CreateItemDto {
  title: string;
  description: string;
  category: 'Lost' | 'Found';
  location: string;
  date: string;
}

export interface UpdateItemDto {
  title?: string;
  description?: string;
  category?: 'Lost' | 'Found';
  location?: string;
  date?: string;
  status?: 'open' | 'claimed';
}

@Injectable({
  providedIn: 'root'
})
export class LostItemService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:4000/api/items';

  getItems(filters?: {
    status?: 'open' | 'claimed';
    category?: 'Lost' | 'Found';
    q?: string;
  }): Observable<LostFoundItem[]> {
    let url = this.apiUrl;
    const params = new URLSearchParams();

    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
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
