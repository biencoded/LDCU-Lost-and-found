
// ...existing code...
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
  protected registrationSuccess = false;
  protected mode: 'login' | 'register' = 'login';

  // Login fields
  protected username = '';
  protected password = '';
  protected showPassword = false;
  protected loginRole: 'admin' | 'user' = 'user';

  // Register fields
  protected registerName = '';
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
    this.registerName = '';
    this.registerUsername = '';
    this.registerPassword = '';
  }

  protected async login(role: 'admin' | 'user') {
    this.error = '';

    if (!this.username || !this.password) {
      this.error = 'Please enter your username and password.';
      return;
    }

    try {
      this.loading = true;
      await firstValueFrom(this.authService.login(this.username, this.password, role));
      // Verify session state updated
      await firstValueFrom(this.authService.checkSession());
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
    this.registrationSuccess = false;

    if (!this.registerName || !this.registerUsername || !this.registerPassword) {
      this.error = 'Please fill in name, username, and password.';
      return;
    }

    try {
      this.loading = true;
      // Prepare for backend name saving: send name if backend supports it
      await firstValueFrom(
        this.authService.register({
          username: this.registerUsername,
          password: this.registerPassword,
          name: this.registerName
        })
      );
      this.registrationSuccess = true;
      setTimeout(() => {
        this.mode = 'login';
        this.clearFields();
        this.username = this.registerUsername;
        this.registrationSuccess = false;
      }, 2000);
    } catch (error: any) {
      // Show backend error message if available
      if (error instanceof HttpErrorResponse && error.error && error.error.error) {
        this.error = error.error.error;
      } else if (error && error.message) {
        this.error = error.message;
      } else {
        this.error = 'Unable to register right now.';
      }
    } finally {
      this.loading = false;
    }
  }

  forgotPassword() {
    alert('Forgot password functionality coming soon!');
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      return error.error?.error || fallback;
    }
    return fallback;
  }
}
