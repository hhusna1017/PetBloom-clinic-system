import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-staff-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './staff-login.html',
  styleUrl: './staff-login.css'
})
export class StaffLogin {
  staffId = '';
  password = '';
  errorMessage = '';

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.staffId.trim()) {
      this.errorMessage = 'Staff ID must be filled out.';
      return;
    }
    if (!this.password) {
      this.errorMessage = 'Password must be filled out.';
      return;
    }

    // Backend belum siap. Nanti sambung kat sini guna HttpClient.
    console.log('Staff login submitted:', this.staffId);
  }
}