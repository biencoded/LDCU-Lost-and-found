import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth.service';
import { LostItemService, CreateItemDto } from './lost-item.service';

@Component({
  standalone: true,
  selector: 'app-report',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'] // ✅ ADD THIS
})
export class ReportComponent {
  protected readonly authService = inject(AuthService);
  protected readonly lostItemService = inject(LostItemService);
  protected readonly router = inject(Router);
  
  protected readonly isAuthenticated = this.authService.isAuthenticated;
  protected readonly currentUser = this.authService.currentUser;
  
  protected formData = signal<CreateItemDto>({
    title: '',
    description: '',
    category: 'Lost',
    location: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  protected isLoading = signal(false);
  protected successMessage = signal<string | null>(null);
  protected errorMessage = signal<string | null>(null);
  
  protected isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }
  
  protected canPost(): boolean {
    return !!this.currentUser();
  }
  
  protected onTitleChange(value: string): void {
    const current = this.formData();
    this.formData.set({ ...current, title: value });
  }
  
  protected onCategoryChange(value: string): void {
    const current = this.formData();
    this.formData.set({ ...current, category: value as 'Lost' | 'Found' });
  }
  
  protected onLocationChange(value: string): void {
    const current = this.formData();
    this.formData.set({ ...current, location: value });
  }
  
  protected onDateChange(value: string): void {
    const current = this.formData();
    this.formData.set({ ...current, date: value });
  }
  
  protected onDescriptionChange(value: string): void {
    const current = this.formData();
    this.formData.set({ ...current, description: value });
  }
  
  protected onSubmit(): void {
    if (!this.canPost()) {
      this.errorMessage.set('You must be logged in to post a lost item');
      return;
    }
    
    if (!this.validateForm()) {
      this.errorMessage.set('Please fill in all required fields');
      return;
    }
    
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    
    this.lostItemService.createItem(this.formData()).subscribe({
      next: (item) => {
        this.isLoading.set(false);
        this.successMessage.set(`Lost item "${item.title}" posted successfully!`);
        this.resetForm();
        setTimeout(() => {
          this.router.navigate(['/search']);
        }, 2000);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.error || 'Failed to post lost item');
      }
    });
  }
  
  private validateForm(): boolean {
    const form = this.formData();
    return !!(form.title.trim() && form.description.trim() && 
              form.category && form.location.trim() && form.date);
  }
  
  private resetForm(): void {
    this.formData.set({
      title: '',
      description: '',
      category: 'Lost',
      location: '',
      date: new Date().toISOString().split('T')[0]
    });
  }
}