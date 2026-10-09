import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

export interface PetOwnerProfile {
  name: string;
  phone: string;
  email: string;
  address: string;
}

type ModalType = 'edit' | 'logout' | null;

@Component({
  selector: 'app-profile-pet-owner',
  standalone: true,
  imports: [FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './profile-petOwner.html',
  styleUrl: './profile-petOwner.css',
})
export class ProfilePetOwner implements OnInit {
  profile = signal<PetOwnerProfile>({ name: '', phone: '', email: '', address: '' });
  loading = signal(true);
  saving = signal(false);

  modal = signal<ModalType>(null);
  notice = signal('');
  noticeOk = signal(true);

  form: PetOwnerProfile = { name: '', phone: '', email: '', address: '' };

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    // TODO: ganti dengan API call bila backend siap
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

  private showNotice(msg: string, ok = true): void {
    this.noticeOk.set(ok);
    this.notice.set(msg);
    setTimeout(() => this.notice.set(''), 3000);
  }

  // ── Modals ─────────────────────────────────────────────────
  openModal(): void {
    this.form = { ...this.profile() };
    this.modal.set('edit');
  }

  closeModal(): void {
    this.modal.set(null);
  }

  // ── Edit ───────────────────────────────────────────────────
  saveProfile(): void {
    const { name, phone, email, address } = this.form;
    if (!name.trim() || !phone.trim() || !email.trim() || !address.trim()) {
      this.closeModal();
      return this.showNotice('Please fill in all fields.', false);
    }

    const payload: PetOwnerProfile = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
    };

    this.saving.set(true);

    // TODO: ganti dengan API call bila backend siap
    setTimeout(() => {
      this.profile.set(payload);
      this.saving.set(false);
      this.closeModal();
      this.showNotice('Profile updated successfully.');
    }, 400);
  }

  confirmProfile(): void {
    // TODO: hantar ke API bila siap
    this.showNotice('Profile confirmed.');
  }

  // ── Logout ─────────────────────────────────────────────────
  logout(): void {
    // TODO: clear token/session bila auth siap
    this.closeModal();
    this.router.navigate(['/home']);
  }
}