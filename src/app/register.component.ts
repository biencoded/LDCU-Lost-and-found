import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  protected name = '';
  protected email = '';
  protected password = '';
  protected role: 'admin' | 'student' = 'student';
  protected error = '';
  protected loading = false;

  constructor(private router: Router, private authService: AuthService) {}

  protected register() {
    this.error = '';
    this.loading = true;

    const result = this.authService.register(this.name, this.email, this.password, this.role);
    this.loading = false;

    if (!result.success) {
      this.error = result.error;
      return;
    }

    this.router.navigate(['/login']);
  }
}