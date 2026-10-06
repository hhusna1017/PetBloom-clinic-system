import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login-petowner.html',
  styleUrl: './login-petowner.css'
})
export class Login {
  email = '';
  password = '';
  errorMessage = '';

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.email.trim()) {
      this.errorMessage = 'Email address must be filled out.';
      return;
    }
    if (!this.password) {
      this.errorMessage = 'Password must be filled out.';
      return;
    }

    console.log('Login submitted:', this.email);
  }
}