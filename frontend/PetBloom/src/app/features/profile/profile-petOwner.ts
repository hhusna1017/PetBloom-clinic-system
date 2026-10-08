import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
// TODO: bila backend siap, uncomment & guna HttpClient
// import { HttpClient } from '@angular/common/http';
// import { inject } from '@angular/core';

export interface PetOwnerProfile {
  name: string;
  phone: string;
  email: string;
  address: string;
}

@Component({
  selector: 'app-profile-pet-owner',
  standalone: true,
  imports: [FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './profile-petOwner.html',
  styleUrl: './profile-petOwner.css',
})
export class ProfilePetOwner implements OnInit {
   menu = [
    { label: 'My Profile', icon: '👤', link: '/profile' },
    { label: 'My Appointments', icon: '📅', link: '/appointment' },
    { label: 'My Pets', icon: '🐾', link: '/my-pets' },
    { label: 'My Payment', icon: '💳', link: '/payment' },
  ];
  // private http = inject(HttpClient);

  profile = signal<PetOwnerProfile>({ name: '', phone: '', email: '', address: '' });
  loading = signal(true);
  saving = signal(false);
  modalOpen = signal(false);
  logoutModalOpen = signal(false);
  toast = signal({ show: false, message: '', success: true });

  // data untuk form dalam modal
  form: PetOwnerProfile = { name: '', phone: '', email: '', address: '' };

  private toastTimer: any;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  /** Ambil profile owner. Sekarang guna mock data; tukar ke API bila siap. */
  loadProfile(): void {
    // TODO: ganti dengan API call, contoh:
    // this.http.get<PetOwnerProfile>('/api/pet-owner/me').subscribe({
    //   next: (data) => { this.profile.set(data); this.loading.set(false); },
    //   error: () => { this.loading.set(false); this.showToast('❌ Failed to load profile.', false); },
    // });

    // --- MOCK DATA (buang bila API dah ada) ---
    setTimeout(() => {
      this.profile.set({
        name: 'WAN NURAIN BATRISYIA',
        phone: '012-3456789',
        email: 'wan@gmail.com',
        address: 'No. 12, Jalan Cyber 1, Cyberjaya, Selangor',
      });
      this.loading.set(false);
    }, 300);
  }

  openModal(): void {
    this.form = { ...this.profile() };
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  saveProfile(): void {
    const { name, phone, email, address } = this.form;
    if (!name.trim() || !phone.trim() || !email.trim() || !address.trim()) {
      this.showToast('⚠️ Please fill in all fields.', false);
      return;
    }

    const payload: PetOwnerProfile = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
    };

    this.saving.set(true);

    // TODO: ganti dengan API call, contoh:
    // this.http.put('/api/pet-owner/me', payload).subscribe({
    //   next: () => this.onSaved(payload),
    //   error: () => { this.saving.set(false); this.showToast('❌ Update failed. Please try again.', false); },
    // });

    // --- MOCK (buang bila API dah ada) ---
    setTimeout(() => this.onSaved(payload), 400);
  }

  private onSaved(payload: PetOwnerProfile): void {
    this.profile.set(payload);
    this.saving.set(false);
    this.closeModal();
    this.showToast('✅ Profile updated successfully!');
  }

  confirmProfile(): void {
    this.showToast('✅ Profile confirmed!');
  }

 openLogoutModal(): void {
  this.logoutModalOpen.set(true);
}

closeLogoutModal(): void {
  this.logoutModalOpen.set(false);
}

logout(): void {
  if (confirm('Are you sure you want to logout?')) {
    this.router.navigate(['/home']);
  }
}

  showToast(message: string, success = true): void {
    clearTimeout(this.toastTimer);
    this.toast.set({ show: true, message, success });
    this.toastTimer = setTimeout(() => this.toast.update((t) => ({ ...t, show: false })), 3000);
  }
}