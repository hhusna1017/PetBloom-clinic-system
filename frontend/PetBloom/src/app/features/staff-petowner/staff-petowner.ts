import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
// import { HttpClient } from '@angular/common/http'; // <- uncomment bila API dah siap

export interface Owner {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string | null;
}

export interface Pet {
  id: number;
  name: string;
  type: string;
  breed: string | null;
  age: string; // contoh: "2 months", "1 year", "3 years"
  ownerId: number;
}

type ModalMode = 'add-owner' | 'edit-owner' | 'add-pet' | 'edit-pet' | null;
type AgeUnit = 'year' | 'month';

interface OwnerForm {
  id: number | null;
  name: string;
  phone: string;
  email: string;
  address: string;
  password: string;
}

interface PetForm {
  id: number | null;
  name: string;
  type: string;
  breed: string;
  ageNum: number | null;
  ageUnit: AgeUnit;
  ownerId: number | null;
}

interface PageMessage {
  type: 'error' | 'success';
  text: string;
  showSteps?: boolean;
}

@Component({
  selector: 'app-staff-petowner',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './staff-petowner.html',
  styleUrl: './staff-petowner.css',
})
export class StaffPetOwner implements OnInit {
  /** Tukar jadi false bila backend + API dah siap */
  private readonly useMock = true;

  logoUrl = '/image/logo.png';

  menuItems = [
    { label: 'Dashboard', path: '/dashboard-staff', icon: '🏠' },
    { label: 'Appointment', path: '/staff/appointment', icon: '📅' },
    { label: 'Pet & Owner', path: '/staff-petowner', icon: '🐶' },
    { label: 'Treatment', path: '/staff/treatment', icon: '💉' },
    { label: 'Payment', path: '/staff-payment', icon: '💳' },
  ];

  ownerHeaders = ['Owner ID', 'Name', 'Phone', 'Email', 'Address', 'Action'];
  petHeaders = ['Pet ID', 'Name', 'Type', 'Breed', 'Age', 'Owner', 'Action'];
  petTypes = ['Cat', 'Dog', 'Rabbit', 'Bird', 'Fish', 'Reptile', 'Other'];

  // ── Shared Tailwind class strings (supaya HTML tak panjang sangat) ──
  thClass = 'px-4 py-3.5 text-center text-xs font-black uppercase tracking-wide text-[#004d61]';
  tdClass = 'px-4 py-3.5 text-center text-[13px] text-gray-700';
  trClass = 'border-b border-gray-100 transition-colors last:border-b-0 hover:bg-[#f0faf9]';
  labelClass = 'text-[11px] font-bold uppercase text-[#007a87]';
  inputClass =
    'w-full rounded-lg border-2 border-[#a8e6e1] px-3 py-2 text-[13px] text-gray-700 outline-none focus:border-[#007a87]';
  btnEditClass =
    'cursor-pointer rounded-md bg-[#007a87] px-3 py-1.5 text-[11px] font-bold uppercase text-white transition-colors hover:bg-[#004d61]';
  btnDelClass =
    'cursor-pointer rounded-md bg-[#e05252] px-3 py-1.5 text-[11px] font-bold uppercase text-white transition-colors hover:bg-[#991b1b]';
  btnSubmitClass = 'cursor-pointer rounded-lg bg-[#007a87] px-5 py-2 font-bold text-white hover:bg-[#004d61]';
  btnCancelClass =
    'cursor-pointer rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-[13px] font-bold text-gray-600 hover:border-gray-500 hover:text-gray-800';

  owners: Owner[] = [];
  pets: Pet[] = [];
  loading = false;
  message: PageMessage | null = null;

  modal: ModalMode = null;
  ownerForm: OwnerForm = this.emptyOwnerForm();
  petForm: PetForm = this.emptyPetForm();

  /** Logout confirmation modal */
  showLogoutModal = false;

  // ── Mock only ──
  private nextOwnerId = 5;
  private nextPetId = 6;
  /** ownerId -> jumlah appointment (untuk test rule delete owner) */
  private mockApptCount: Record<number, number> = { 1: 2, 2: 1 };
  /** petId yang ada appointment/treatment (untuk test error delete pet) */
  private mockPetsWithRecords = new Set<number>([1]);

  // constructor(private http: HttpClient, private router: Router) {}
  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadAll();
  }

  // ───────────── Load ─────────────
  loadAll(): void {
    this.loading = true;

    if (this.useMock) {
      setTimeout(() => {
        this.owners = [
          { id: 1, name: 'Ahmad Faiz', phone: '012-3456789', email: 'faiz@email.com', address: 'No 12, Jalan Maju, Cyberjaya' },
          { id: 2, name: 'Siti Nurhaliza', phone: '013-2223344', email: 'siti@email.com', address: 'Putrajaya' },
          { id: 3, name: 'Lim Wei Jie', phone: '016-7778899', email: 'weijie@email.com', address: null },
          { id: 4, name: 'Priya Devi', phone: '011-5556677', email: 'priya@email.com', address: 'Kajang, Selangor' },
        ];
        this.pets = [
          { id: 1, name: 'Milo', type: 'Cat', breed: 'Persian', age: '3 years', ownerId: 1 },
          { id: 2, name: 'Luna', type: 'Cat', breed: 'British Shorthair', age: '8 months', ownerId: 1 },
          { id: 3, name: 'Bruno', type: 'Dog', breed: 'Husky', age: '2 years', ownerId: 3 },
          { id: 4, name: 'Kiki', type: 'Rabbit', breed: null, age: '1 year', ownerId: 4 },
          { id: 5, name: 'Coco', type: 'Bird', breed: 'Cockatiel', age: '6 months', ownerId: 2 },
        ];
        this.loading = false;
      }, 300);
      return;
    }

    /* ── Bila API dah siap ──
    this.http.get<Owner[]>('/api/staff/owners').subscribe({
      next: (list) => (this.owners = list),
      error: () => this.setMessage('error', 'Failed to load owners.'),
    });
    this.http.get<Pet[]>('/api/staff/pets').subscribe({
      next: (list) => { this.pets = list; this.loading = false; },
      error: () => { this.setMessage('error', 'Failed to load pets.'); this.loading = false; },
    });
    */
  }

  ownerName(ownerId: number): string {
    return this.owners.find((o) => o.id === ownerId)?.name ?? '-';
  }

  // ───────────── Modal open/close ─────────────
  openAddOwner(): void {
    this.ownerForm = this.emptyOwnerForm();
    this.modal = 'add-owner';
  }

  openEditOwner(o: Owner): void {
    this.ownerForm = {
      id: o.id,
      name: o.name,
      phone: o.phone,
      email: o.email,
      address: o.address ?? '',
      password: '',
    };
    this.modal = 'edit-owner';
  }

  openAddPet(): void {
    this.petForm = this.emptyPetForm();
    this.modal = 'add-pet';
  }

  openEditPet(p: Pet): void {
    const age = this.parseAge(p.age);
    this.petForm = {
      id: p.id,
      name: p.name,
      type: p.type,
      breed: p.breed ?? '',
      ageNum: age.num,
      ageUnit: age.unit,
      ownerId: p.ownerId,
    };
    this.modal = 'edit-pet';
  }

  closeModal(): void {
    this.modal = null;
  }

  // ───────────── Owner: save ─────────────
  saveOwner(): void {
    const f = this.ownerForm;
    if (!f.name.trim() || !f.phone.trim() || !f.email.trim()) return;

    // NOTE: password JANGAN hash kat frontend. Hantar plain (melalui HTTPS) dan backend yang hash (bcrypt/argon2).
    const payload = {
      name: f.name.trim(),
      phone: f.phone.trim(),
      email: f.email.trim(),
      address: f.address.trim() || null,
    };

    if (this.useMock) {
      if (this.modal === 'add-owner') {
        this.owners = [...this.owners, { id: this.nextOwnerId++, ...payload }];
      } else {
        this.owners = this.owners.map((o) => (o.id === f.id ? { ...o, ...payload } : o));
      }
      this.closeModal();
      return;
    }

    /* ── Bila API dah siap ──
    const req$ =
      this.modal === 'add-owner'
        ? this.http.post('/api/staff/owners', { ...payload, password: f.password })
        : this.http.put(`/api/staff/owners/${f.id}`, payload);

    req$.subscribe({
      next: () => { this.closeModal(); this.loadAll(); },
      error: (err) => this.setMessage('error', err.error?.message ?? 'Failed to save owner.'),
    });
    */
  }

  // ───────────── Owner: delete ─────────────
  deleteOwner(o: Owner): void {
    if (
      !window.confirm(
        `Delete owner ${o.name}?\n\nMake sure all their appointments, treatments, payments and pets are deleted first.`,
      )
    )
      return;

    if (this.useMock) {
      const petCount = this.pets.filter((p) => p.ownerId === o.id).length;
      const apptCount = this.mockApptCount[o.id] ?? 0;

      if (petCount > 0 && apptCount > 0) {
        this.setMessage(
          'error',
          `Cannot delete owner ${o.name} — they still have ${petCount} pet(s) and ${apptCount} appointment(s) registered.`,
          true,
        );
      } else if (petCount > 0) {
        this.setMessage('error', `Cannot delete owner ${o.name} — they still have ${petCount} pet(s) registered.`, true);
      } else if (apptCount > 0) {
        this.setMessage(
          'error',
          `Cannot delete owner ${o.name} — they still have ${apptCount} appointment(s) registered.`,
          true,
        );
      } else {
        this.owners = this.owners.filter((x) => x.id !== o.id);
        this.setMessage('success', '✅ Owner deleted successfully.');
      }
      return;
    }

    /* ── Bila API dah siap ── (backend patut pulangkan 409 + message kalau owner masih ada pet/appointment)
    this.http.delete(`/api/staff/owners/${o.id}`).subscribe({
      next: () => { this.setMessage('success', '✅ Owner deleted successfully.'); this.loadAll(); },
      error: (err) => this.setMessage('error', err.error?.message ?? 'Delete failed.', true),
    });
    */
  }

  // ───────────── Pet: save ─────────────
  savePet(): void {
    const f = this.petForm;
    if (!f.name.trim() || !f.type || f.ageNum === null || !f.ownerId) return;

    const payload = {
      name: f.name.trim(),
      type: f.type,
      breed: f.breed.trim() || null,
      age: this.buildAge(f.ageNum, f.ageUnit),
      ownerId: f.ownerId,
    };

    if (this.useMock) {
      if (this.modal === 'add-pet') {
        this.pets = [...this.pets, { id: this.nextPetId++, ...payload }];
      } else {
        this.pets = this.pets.map((p) => (p.id === f.id ? { ...p, ...payload } : p));
      }
      this.closeModal();
      return;
    }

    /* ── Bila API dah siap ──
    const req$ =
      this.modal === 'add-pet'
        ? this.http.post('/api/staff/pets', payload)
        : this.http.put(`/api/staff/pets/${f.id}`, payload);

    req$.subscribe({
      next: () => { this.closeModal(); this.loadAll(); },
      error: (err) => this.setMessage('error', err.error?.message ?? 'Failed to save pet.'),
    });
    */
  }

  // ───────────── Pet: delete ─────────────
  deletePet(p: Pet): void {
    if (
      !window.confirm(`Delete pet ${p.name}?\n\nMake sure all linked appointments and treatments are deleted first.`)
    )
      return;

    if (this.useMock) {
      if (this.mockPetsWithRecords.has(p.id)) {
        this.setMessage(
          'error',
          `Cannot delete pet ${p.name}: this pet may still have linked appointments or treatment records. Please delete those first.`,
          true,
        );
      } else {
        this.pets = this.pets.filter((x) => x.id !== p.id);
        this.setMessage('success', '✅ Pet deleted successfully.');
      }
      return;
    }

    /* ── Bila API dah siap ──
    this.http.delete(`/api/staff/pets/${p.id}`).subscribe({
      next: () => { this.setMessage('success', '✅ Pet deleted successfully.'); this.loadAll(); },
      error: (err) => this.setMessage('error', err.error?.message ?? 'Delete failed.', true),
    });
    */
  }

  // ───────────── Misc ─────────────
  scrollToPets(): void {
    document.getElementById('section-pets')?.scrollIntoView({ behavior: 'smooth' });
  }

  // ───────────── Logout modal ─────────────
  openLogout(): void {
    this.showLogoutModal = true;
  }

  closeLogout(): void {
    this.showLogoutModal = false;
  }

  logout(): void {
    this.showLogoutModal = false;
    // TODO: clear token / panggil API logout
    this.router.navigate(['/staff/login']);
  }

  private setMessage(type: 'error' | 'success', text: string, showSteps = false): void {
    this.message = { type, text, showSteps };
    setTimeout(() => document.getElementById('page-message')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  /** (3, 'year') -> "3 years" | (1, 'year') -> "1 year" | (2, 'month') -> "2 months" */
  private buildAge(num: number, unit: AgeUnit): string {
    return `${num} ${unit}${num === 1 ? '' : 's'}`;
  }

  /** "2 months" -> { num: 2, unit: 'month' } */
  private parseAge(age: string): { num: number | null; unit: AgeUnit } {
    const m = /^(\d+)\s*(month|year)/i.exec((age ?? '').trim());
    return m ? { num: Number(m[1]), unit: m[2].toLowerCase() as AgeUnit } : { num: null, unit: 'year' };
  }

  private emptyOwnerForm(): OwnerForm {
    return { id: null, name: '', phone: '', email: '', address: '', password: '' };
  }

  private emptyPetForm(): PetForm {
    return { id: null, name: '', type: '', breed: '', ageNum: null, ageUnit: 'year', ownerId: null };
  }
}