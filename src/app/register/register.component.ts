import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../shared/types';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html'
})

export class RegisterComponent {
  protected name = '';
  protected username = '';
  protected password = '';
  protected error = '';
  protected loading = false;

  constructor(private router: Router, private authService: AuthService) {}

  protected async register() {
    this.error = '';
    if (!this.name || !this.username || !this.password) {
      this.error = 'Please fill in name, username, and password.';
      return;
    }
    this.loading = true;

    const data: RegisterDto = {
      username: this.username,
      password: this.password,
      name: this.name
    };

    try {
      await firstValueFrom(this.authService.register(data));
      this.router.navigate(['/login']);
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        this.error = error.error?.error || 'Unable to register right now.';
      } else {
        this.error = 'Unable to register right now.';
      }
    } finally {
      this.loading = false;
    }
  }
}
