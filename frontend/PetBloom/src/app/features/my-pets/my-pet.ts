import { Component, OnInit, signal } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

export interface Pet {
  id: number;
  name: string;
  type: string;
  breed: string;
  age: string; // e.g. "3 Years"
}

interface PetForm {
  name: string;
  type: string;
  breed: string;
  ageValue: number | null;
  ageUnit: 'Years' | 'Months';
}

const EMPTY_FORM: PetForm = { name: '', type: '', breed: '', ageValue: null, ageUnit: 'Years' };

@Component({
  selector: 'app-my-pet',
  standalone: true,
  imports: [FormsModule, RouterLink, RouterLinkActive, UpperCasePipe],
  templateUrl: './my-pet.html',
  styleUrl: './my-pet.css',
})
export class MyPet implements OnInit {
  // ── Sidebar ────────────────────────────────────────────────
  menu = [
    { label: 'My Profile', icon: '👤', link: '/profile' },
    { label: 'My Appointments', icon: '📅', link: '/appointment' },
    { label: 'My Pets', icon: '🐾', link: '/my-pets' },
    { label: 'My Payment', icon: '💳', link: '/payment' },
  ];

  // ── Dropdown data ──────────────────────────────────────────
  petTypes = ['Cat', 'Dog', 'Rabbit', 'Bird', 'Other'];

  private breedOptions: Record<string, string[]> = {
    Cat: ['Domestic Shorthair', 'Persian', 'Siamese', 'British Shorthair', 'Maine Coon', 'Mixed Breed'],
    Dog: ['Poodle', 'Golden Retriever', 'German Shepherd', 'Chihuahua', 'Local / Mixed Breed'],
    Rabbit: ['Angora', 'Netherland Dwarf', 'Lionhead', 'Local / Mixed Breed'],
    Bird: ['Budgerigar', 'Lovebird', 'Cockatiel'],
    Other: ['Hamster', 'Guinea Pig', 'Sugar Glider'],
  };

  // ── State ──────────────────────────────────────────────────
  pets = signal<Pet[]>([]);
  loading = signal(true);
  saving = signal(false);

  showFormModal = signal(false);
  showLogoutModal = signal(false);
  editingId = signal<number | null>(null); // null = add mode
  petToDelete = signal<Pet | null>(null);
  breedList = signal<string[]>([]);

  form: PetForm = { ...EMPTY_FORM };

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadPets();
  }

  // ── Load ───────────────────────────────────────────────────
  loadPets(): void {
    this.loading.set(true);

    // TODO: ganti dengan API call, contoh:
    // this.petService.getMyPets().subscribe({
    //   next: (data) => { this.pets.set(data); this.loading.set(false); },
    //   error: () => this.loading.set(false),
    // });

    // Mock data sementara
    this.pets.set([
      { id: 1, name: 'Mochi', type: 'Cat', breed: 'Persian', age: '3 Years' },
      { id: 2, name: 'Bruno', type: 'Dog', breed: 'Golden Retriever', age: '8 Months' },
    ]);
    this.loading.set(false);
  }

  // ── Helpers ────────────────────────────────────────────────
  getEmoji(type: string): string {
    const t = type.toLowerCase();
    if (t.includes('cat')) return '🐱';
    if (t.includes('dog')) return '🐶';
    if (t.includes('rabbit')) return '🐰';
    if (t.includes('bird')) return '🐦';
    if (t.includes('fish')) return '🐠';
    if (t.includes('turtle')) return '🐢';
    return '🐾';
  }

  onTypeChange(): void {
    this.breedList.set(this.breedOptions[this.form.type] ?? []);
    this.form.breed = '';
  }

  // ── Modals ─────────────────────────────────────────────────
  openAddModal(): void {
    this.editingId.set(null);
    this.form = { ...EMPTY_FORM };
    this.breedList.set([]);
    this.showFormModal.set(true);
  }

  openEditModal(pet: Pet): void {
    const [value, unit] = pet.age.split(' ');
    this.editingId.set(pet.id);
    this.breedList.set(this.breedOptions[pet.type] ?? []);
    this.form = {
      name: pet.name,
      type: pet.type,
      breed: pet.breed,
      ageValue: Number(value),
      ageUnit: unit === 'Months' ? 'Months' : 'Years',
    };
    this.showFormModal.set(true);
  }

  openDeleteModal(pet: Pet): void {
    this.petToDelete.set(pet);
  }

  closeModals(): void {
    this.showFormModal.set(false);
    this.showLogoutModal.set(false);
    this.petToDelete.set(null);
  }

  // ── Create / Update ────────────────────────────────────────
  savePet(): void {
    const payload = {
      name: this.form.name.trim(),
      type: this.form.type,
      breed: this.form.breed,
      age: `${Math.max(0, Math.floor(this.form.ageValue ?? 0))} ${this.form.ageUnit}`,
    };
    const id = this.editingId();

    this.saving.set(true);

    // TODO: ganti dengan API call:
    // const req$ = id === null
    //   ? this.petService.addPet(payload)
    //   : this.petService.updatePet(id, payload);
    // req$.subscribe({
    //   next: () => { this.loadPets(); this.closeModals(); this.saving.set(false); },
    //   error: () => this.saving.set(false),
    // });

    // Mock sementara (update state kat frontend je)
    if (id === null) {
      const nextId = Math.max(0, ...this.pets().map((p) => p.id)) + 1;
      this.pets.update((list) => [...list, { id: nextId, ...payload }]);
    } else {
      this.pets.update((list) => list.map((p) => (p.id === id ? { id, ...payload } : p)));
    }
    this.saving.set(false);
    this.closeModals();
  }

  // ── Delete ─────────────────────────────────────────────────
  confirmDelete(): void {
    const pet = this.petToDelete();
    if (!pet) return;

    // TODO: ganti dengan API call:
    // this.petService.deletePet(pet.id).subscribe(() => { this.loadPets(); this.closeModals(); });
    // Nota: cascade delete (appointment/payment) patutnya backend yang handle.

    this.pets.update((list) => list.filter((p) => p.id !== pet.id));
    this.closeModals();
  }

  // ── Logout ─────────────────────────────────────────────────
  logout(): void {
    // TODO: clear token/session bila auth siap
    this.closeModals();
    this.router.navigate(['/home']);
  }
}