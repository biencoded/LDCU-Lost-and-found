import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';

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
  protected username = '';
  protected password = '';
  protected showPassword = false;
  protected loginRole: 'admin' | 'user' = 'user';

  // Register fields
  protected registerUsername = '';
  protected registerPassword = '';
  protected showRegisterPassword = false;

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
    this.username = '';
    this.password = '';
    this.registerUsername = '';
    this.registerPassword = '';
  }

  protected async login(role: 'admin' | 'user') {
    this.error = '';

    if (!this.username || !this.password) {
      this.error = 'Please enter both username and password.';
      return;
    }

    try {
      this.loading = true;
      await firstValueFrom(this.authService.login(this.username, this.password, role));
      const redirectUrl = this.route.snapshot.queryParamMap.get('redirectUrl') || '/';
      this.router.navigateByUrl(redirectUrl);
    } catch (error) {
      this.error = this.getErrorMessage(error, 'Unable to sign in right now.');
    } finally {
      this.loading = false;
    }
  }

  protected async register() {
    this.error = '';

    if (!this.registerUsername || !this.registerPassword) {
      this.error = 'Please fill in username and password.';
      return;
    }

    try {
      this.loading = true;
      await firstValueFrom(
        this.authService.register(this.registerUsername, this.registerPassword),
      );
      this.mode = 'login';
      this.clearFields();
      this.username = this.registerUsername;
      this.error = 'Registration successful! Please log in.';
    } catch (error) {
      this.error = this.getErrorMessage(error, 'Unable to register right now.');
    } finally {
      this.loading = false;
    }
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      return error.error?.error || fallback;
    }
    return fallback;
  }
}
