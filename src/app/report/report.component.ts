import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { LostItemService, CreateItemDto } from '../services/lost-item.service';

@Component({
  standalone: true,
  selector: 'app-report',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent {
  protected readonly authService = inject(AuthService);
  protected readonly lostItemService = inject(LostItemService);
  protected readonly router = inject(Router);
  
  protected readonly isAuthenticated = this.authService.isAuthenticated;
  protected readonly currentUser = this.authService.currentUser;
  
  protected formData = signal<CreateItemDto>({
    item_name: '',
    description: '',
    title: '',
    category: '',
    location: '',
    date: '',
    photo: ''
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
  
  protected onItemNameChange(value: string): void {
    const current = this.formData();
    this.formData.set({ ...current, item_name: value });
  }
  
  protected onDescriptionChange(value: string): void {
    const current = this.formData();
    this.formData.set({ ...current, description: value });
  }
  
  protected onTitleChange(value: string): void {
    const current = this.formData();
    this.formData.set({ ...current, title: value });
  }
  
  protected onCategoryChange(value: string): void {
    const current = this.formData();
    this.formData.set({ ...current, category: value });
  }
  
  protected onLocationChange(value: string): void {
    const current = this.formData();
    this.formData.set({ ...current, location: value });
  }
  
  protected onDateChange(value: string): void {
    const current = this.formData();
    this.formData.set({ ...current, date: value });
  }
  
  protected photoFileName = signal<string | null>(null);
  
  protected onPhotoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.photoFileName.set(file.name);
      // For now, just set a placeholder
      const current = this.formData();
      this.formData.set({ ...current, photo: 'placeholder' });
    }
  }
  
  protected removePhoto(input: HTMLInputElement): void {
    input.value = '';
    this.photoFileName.set(null);
    const current = this.formData();
    this.formData.set({ ...current, photo: '' });
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
        this.successMessage.set(`Lost item "${item.item_name}" posted successfully!`);
        this.resetForm();
        setTimeout(() => {
          this.router.navigate(['/gallery']);
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
    return !!(form.item_name.trim() && form.description.trim());
  }
  
  private resetForm(): void {
    this.formData.set({
      item_name: '',
      description: ''
    });
  }
}
