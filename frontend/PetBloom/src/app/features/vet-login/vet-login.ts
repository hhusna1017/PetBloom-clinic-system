import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-vet-login',
  imports: [FormsModule],
  templateUrl: './vet-login.html',
  styleUrl: './vet-login.css'
})
export class VetLogin {
  vetId = '';
  password = '';
  errorMessage = '';

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.vetId.trim()) {
      this.errorMessage = 'Vet ID must be filled out.';
      return;
    }
    if (!this.password) {
      this.errorMessage = 'Password must be filled out.';
      return;
    }

    // Backend belum siap. Nanti sambung kat sini guna HttpClient.
    console.log('Vet login submitted:', this.vetId);
  }
}