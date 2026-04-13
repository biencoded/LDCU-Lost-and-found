import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  protected mode: 'login' | 'register' = 'login';

  // Login fields
  protected email = '';
  protected password = '';

  // Register fields
  protected name = '';
  protected registerEmail = '';
  protected registerPassword = '';
  protected role: 'admin' | 'student' = 'student';
  protected loginRole: 'admin' | 'student' = 'student';

  protected error = '';
  protected loading = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute,
  ) {}

  protected toggleMode() {
    this.mode = this.mode === 'login' ? 'register' : 'login';
    this.error = '';
    this.clearFields();
  }

  private clearFields() {
    this.email = '';
    this.password = '';
    this.name = '';
    this.registerEmail = '';
    this.registerPassword = '';
    this.role = 'student';
  }

  protected login(role: 'admin' | 'student') {
    this.error = '';

    if (!this.email || !this.password) {
      this.error = 'Please enter both email and password.';
      return;
    }

    this.loading = true;
    const result = this.authService.login(this.email, this.password, role);
    this.loading = false;

    if (!result.success) {
      this.error = result.error;
      return;
    }

    const redirectUrl = this.route.snapshot.queryParamMap.get('redirectUrl') || '/';
    this.router.navigateByUrl(redirectUrl);
  }

  protected register() {
    this.error = '';

    if (!this.name || !this.registerEmail || !this.registerPassword || !this.role) {
      this.error = 'Please fill in all registration fields.';
      return;
    }

    this.loading = true;
    const result = this.authService.register(this.name, this.registerEmail, this.registerPassword, this.role);
    this.loading = false;

    if (!result.success) {
      this.error = result.error;
      return;
    }

    // Switch to login mode after successful registration
    this.mode = 'login';
    this.email = this.registerEmail;
    this.password = '';
    this.clearFields();
    this.error = 'Registration successful! Please log in.';
  }
}
