import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router'; // 1. TAMBAH IMPORT NI!

@Component({
  selector: 'app-register-staff',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink], // 2. MASUKKAN RouterLink DI SINI!
  templateUrl: './register-staff.html',
  styleUrl: './register-staff.css',
})
export class RegisterStaffComponent {
  // Job titles shown in the dropdown. Edit this list to match the clinic.
  readonly roles = ['Veterinarian', 'Clinic Assistant', 'Admin / Receptionist'];

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly form;

  // 3. TAMBAH private router: Router DI CONSTRUCTOR
  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.nonNullable.group({
      staffName: ['', [Validators.required, Validators.maxLength(100)]],
      // digits only, 9 to 11 digits (e.g. 0176543210)
      staffPhone: ['', [Validators.required, Validators.pattern(/^[0-9]{9,11}$/)]],
      staffRole: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  showError(field: 'staffName' | 'staffPhone' | 'staffRole' | 'password'): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || control.dirty);
  }

  submit(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    // TODO: replace this fake call with HttpClient.post() to the Spring Boot API,
    // for example POST http://localhost:8080/api/auth/register-staff
    setTimeout(() => {
      this.loading.set(false);
      const fakeStaffId = 101;
      this.successMessage.set(
        `Staff registration successful! Your Staff ID is ${fakeStaffId}. You can now log in.`,
      );
      this.form.reset();

      // 4. (OPSIONAL) AUTO REDIRECT KE LOGIN LEPAS BERJAYA REGISTER
      // this.router.navigate(['/staff-login']);
    }, 600);
  }
}