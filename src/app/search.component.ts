import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';
import { LostItemService, LostFoundItem } from './lost-item.service';

@Component({
  selector: 'app-search',
  imports: [FormsModule, CommonModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'] // ✅ ADD THIS
})
export class SearchComponent {
  private readonly authService = inject(AuthService);
  private readonly lostItemService = inject(LostItemService);

  protected currentUser = this.authService.currentUser;
  protected searchText = signal('');
  protected filterCategory = signal<'All' | 'Lost' | 'Found'>('All');
  protected filterStatus = signal<'All' | 'open' | 'claimed'>('All');
  
  protected items = signal<LostFoundItem[]>([]);
  protected isLoading = signal(false);
  protected errorMessage = signal<string | null>(null);
  protected successMessage = signal<string | null>(null);
  protected updatingItem = signal<number | null>(null);

  constructor() {
    this.loadItems();
  }

  protected isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }

  protected onSearchChange(value: string): void {
    this.searchText.set(value);
  }

  protected onCategoryChange(value: string): void {
    this.filterCategory.set(value as 'All' | 'Lost' | 'Found');
    this.loadItems();
  }

  protected onStatusChange(value: string): void {
    this.filterStatus.set(value as 'All' | 'open' | 'claimed');
    this.loadItems();
  }

  protected loadItems(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    
    const filters: any = {};
    if (this.filterCategory() !== 'All') {
      filters.category = this.filterCategory();
    }
    if (this.filterStatus() !== 'All') {
      filters.status = this.filterStatus();
    }

    this.lostItemService.getItems(filters).subscribe({
      next: (data) => {
        this.items.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Failed to load lost items');
        this.isLoading.set(false);
      }
    });
  }

  protected get filteredItems(): LostFoundItem[] {
    const searchLower = this.searchText().toLowerCase();
    return this.items().filter(item =>
      item.title.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower) ||
      item.location.toLowerCase().includes(searchLower)
    );
  }

  protected changeStatus(item: LostFoundItem): void {
    if (!this.isAdmin()) return;

    const newStatus = item.status === 'open' ? 'claimed' : 'open';
    this.updatingItem.set(item.id);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    this.lostItemService.updateItem(item.id, { status: newStatus }).subscribe({
      next: (updatedItem) => {
        const currentItems = this.items();
        const index = currentItems.findIndex(i => i.id === item.id);
        if (index !== -1) {
          const newItems = [...currentItems];
          newItems[index] = updatedItem;
          this.items.set(newItems);
        }
        this.updatingItem.set(null);
        this.successMessage.set(`Status changed to "${newStatus}" successfully!`);
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (err) => {
        this.updatingItem.set(null);
        this.errorMessage.set('Failed to update item status');
      }
    });
  }
}