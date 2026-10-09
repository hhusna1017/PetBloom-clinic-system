import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {Router, RouterLink, RouterLinkActive } from '@angular/router';

type Specialization = 'General Practice' | 'Surgery' | 'Dermatology' | '';
type ModalType = 'book' | 'view' | 'cancel' | 'logout' | null;

export interface Appointment {
  id: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  petName: string;
  treatmentName: string;
  cost: number | null;
  paymentMethod: string; // 'Pending' | 'Cash' | ...
  vetName: string | null;
  status: 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';
}

interface PetOption {
  id: number;
  name: string;
}

interface Treatment {
  name: string;
  price: number;
  spec: Specialization;
}

interface Vet {
  id: number;
  name: string;
  specialization: Specialization;
  workDays: string[];
  startTime: string;
  endTime: string;
}

interface BookForm {
  date: string;
  time: string;
  petId: number | null;
  treatmentName: string;
  vetId: number | null;
}

const EMPTY_FORM: BookForm = { date: '', time: '', petId: null, treatmentName: '', vetId: null };

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './appointment.html',
  styleUrl: './appointment.css',
})
export class AppointmentPage implements OnInit {
  constructor(private router: Router) {}

  // ── Sidebar ────────────────────────────────────────────────
  menu = [
    { label: 'My Profile', icon: '👤', link: '/profile' },
    { label: 'My Appointments', icon: '📅', link: '/appointment' },
    { label: 'My Pets', icon: '🐾', link: '/my-pets' },
    { label: 'My Payment', icon: '💳', link: '/payment' },
  ];

  headers = ['Select', 'Date', 'Time', 'Pet', 'Treatment Name', 'Treatment Cost', 'Payment', 'Veterinarian', 'Status'];

  // ── Treatment list (spec = jenis vet yang sesuai) ──────────
  treatments: Treatment[] = [
    { name: 'General Health Check-Up', price: 30, spec: 'General Practice' },
    { name: 'Vaccination - Core (Dog/Cat)', price: 50, spec: 'General Practice' },
    { name: 'Vaccination - Rabies', price: 45, spec: 'General Practice' },
    { name: 'Deworming', price: 25, spec: 'General Practice' },
    { name: 'Flea & Tick Treatment', price: 35, spec: 'Dermatology' },
    { name: 'Spay (Female Sterilisation)', price: 250, spec: 'Surgery' },
    { name: 'Neuter (Male Sterilisation)', price: 180, spec: 'Surgery' },
    { name: 'Dental Scaling & Polishing', price: 120, spec: 'Dermatology' },
    { name: 'Ear Cleaning & Treatment', price: 40, spec: 'General Practice' },
    { name: 'Eye Infection Treatment', price: 45, spec: 'General Practice' },
    { name: 'Skin Allergy Treatment', price: 60, spec: 'Dermatology' },
    { name: 'Wound Dressing & Cleaning', price: 50, spec: 'Surgery' },
    { name: 'X-Ray (Single View)', price: 80, spec: 'Surgery' },
    { name: 'Blood Test - Basic Panel', price: 70, spec: 'General Practice' },
    { name: 'Blood Test - Full Panel', price: 130, spec: 'General Practice' },
    { name: 'Microchip Implant', price: 55, spec: 'General Practice' },
    { name: 'Nail Trimming', price: 20, spec: 'General Practice' },
    { name: 'Minor Surgery', price: 300, spec: 'Surgery' },
    { name: 'Major Surgery', price: 800, spec: 'Surgery' },
    { name: 'Bird General Check-Up', price: 35, spec: 'General Practice' },
    { name: 'Bird Beak & Nail Trim', price: 25, spec: 'General Practice' },
    { name: 'Bird Wing Clipping', price: 20, spec: '' },
    { name: 'Bird Respiratory Treatment', price: 65, spec: 'Dermatology' },
    { name: 'Small Mammal Check-Up', price: 30, spec: 'General Practice' },
    { name: 'Rabbit Neutering', price: 200, spec: 'Surgery' },
    { name: 'Rabbit Dental Trim', price: 60, spec: 'Dermatology' },
    { name: 'Small Mammal Deworming', price: 20, spec: 'General Practice' },
    { name: 'Reptile General Check-Up', price: 40, spec: 'Dermatology' },
    { name: 'Reptile Parasite Treatment', price: 55, spec: 'Dermatology' },
    { name: 'Reptile Shell/Scale Wound Treatment', price: 70, spec: 'Dermatology' },
    { name: 'Fish Disease Diagnosis', price: 30, spec: 'Dermatology' },
    { name: 'Fish Parasite Treatment', price: 40, spec: 'Dermatology' },
    { name: 'Large Animal General Check-Up', price: 80, spec: 'General Practice' },
    { name: 'Large Animal Vaccination', price: 70, spec: 'General Practice' },
    { name: 'Large Animal Deworming', price: 50, spec: 'General Practice' },
    { name: 'Ultrasound Scan', price: 100, spec: 'Surgery' },
    { name: 'ECG (Heart Check)', price: 90, spec: 'Surgery' },
    { name: 'Nutritional & Diet Consultation', price: 40, spec: 'General Practice' },
    { name: 'Emergency Consultation', price: 80, spec: 'General Practice' },
    { name: 'Post-Surgery Follow-Up', price: 30, spec: 'General Practice' },
  ];

  // ── State ──────────────────────────────────────────────────
  appointments = signal<Appointment[]>([]);
  pets = signal<PetOption[]>([]);
  loading = signal(true);
  saving = signal(false);

  selectedId = signal<number | null>(null);
  selected = computed(() => this.appointments().find((a) => a.id === this.selectedId()) ?? null);
  notice = signal('');

  modal = signal<ModalType>(null);
  form: BookForm = { ...EMPTY_FORM };
  cost = signal<number | null>(null);

  availableVets = signal<Vet[]>([]);
  showVetGroup = signal(false);
  vetHint = signal('');

  today = new Date().toISOString().split('T')[0];

  // TODO: bila backend siap, inject service (HttpClient)
  // constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.loadData();
  }

  // ── Load ───────────────────────────────────────────────────
  loadData(): void {
    this.loading.set(true);

    // TODO: ganti dengan API call:
    // this.appointmentService.getMyAppointments().subscribe(...)
    // this.petService.getMyPets().subscribe(...)

    // Mock data sementara
    this.pets.set([
      { id: 1, name: 'Mochi' },
      { id: 2, name: 'Bruno' },
    ]);
    this.appointments.set([
      {
        id: 2,
        date: '2026-10-14',
        time: '09:30',
        petName: 'Bruno',
        treatmentName: 'Vaccination - Rabies',
        cost: 45,
        paymentMethod: 'Pending',
        vetName: 'Aisyah',
        status: 'PENDING',
      },
      {
        id: 1,
        date: '2026-09-28',
        time: '15:00',
        petName: 'Mochi',
        treatmentName: 'General Health Check-Up',
        cost: 30,
        paymentMethod: 'Cash',
        vetName: 'Aisyah',
        status: 'COMPLETED',
      },
    ]);
    this.loading.set(false);
  }

  // ── Helpers ────────────────────────────────────────────────
  formatTime(time: string): string {
    if (!time) return '';
    const [h, m] = time.split(':');
    let hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'p.m.' : 'a.m.';
    if (hour > 12) hour -= 12;
    if (hour === 0) hour = 12;
    return `${hour}.${m} ${ampm}`;
  }

  statusClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'bg-[#fff3cd] text-[#856404]';
      case 'APPROVED':
      case 'COMPLETED':
        return 'bg-[#d1f5ea] text-[#1a7a5e]';
      case 'CANCELLED':
        return 'bg-[#f8d7da] text-[#842029]';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  payClass(method: string): string {
    return method === 'Pending' ? 'bg-[#fff3cd] text-[#856404]' : 'bg-[#d1e7dd] text-[#0f5132]';
  }

  private showNotice(msg: string): void {
    this.notice.set(msg);
    setTimeout(() => this.notice.set(''), 3000);
  }

  // ── Table selection ────────────────────────────────────────
  selectRow(id: number): void {
    this.selectedId.set(id);
    this.notice.set('');
  }

  // ── Modals ─────────────────────────────────────────────────
  openBookModal(): void {
    this.form = { ...EMPTY_FORM };
    this.cost.set(null);
    this.showVetGroup.set(false);
    this.availableVets.set([]);
    this.vetHint.set('');
    this.modal.set('book');
  }

  openViewModal(): void {
    if (!this.selected()) return this.showNotice('Please select an appointment to view.');
    this.modal.set('view');
  }

  openCancelModal(): void {
    const a = this.selected();
    if (!a) return this.showNotice('Please select an appointment to cancel.');
    if (a.status === 'CANCELLED') return this.showNotice('This appointment is already cancelled.');
    this.modal.set('cancel');
  }

  closeModal(): void {
    this.modal.set(null);
  }

  // ── Treatment ──────────────────────────────────────────────
  onTreatmentChange(): void {
    const t = this.treatments.find((x) => x.name === this.form.treatmentName);
    this.cost.set(t ? t.price : null);
    this.form.vetId = null;
    this.loadAvailableVets();
  }

  selectFromList(name: string): void {
    this.form.treatmentName = name;
    this.onTreatmentChange();
  }

  // ── Available vets ─────────────────────────────────────────
  loadAvailableVets(): void {
    const { date, time, treatmentName } = this.form;
    if (!date || !time || !treatmentName) return;

    this.showVetGroup.set(true);
    this.vetHint.set('Loading available vets...');

    // TODO: ganti dengan API call:
    // this.appointmentService.getAvailableVets(date, time, treatmentName).subscribe(vets => { ... });

    // Mock sementara (logic ni patutnya dalam backend)
    const day = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' });
    const spec = this.treatments.find((t) => t.name === treatmentName)?.spec ?? '';
    const mockVets: Vet[] = [
      { id: 1, name: 'Aisyah', specialization: 'General Practice', workDays: ['Monday', 'Tuesday', 'Wednesday'], startTime: '08:00', endTime: '18:00' },
      { id: 2, name: 'Hakim', specialization: 'Surgery', workDays: ['Monday', 'Wednesday'], startTime: '08:00', endTime: '18:00' },
      { id: 3, name: 'Nurul', specialization: 'Dermatology', workDays: ['Tuesday', 'Wednesday'], startTime: '08:00', endTime: '18:00' },
    ];
    const vets = mockVets.filter(
      (v) =>
        v.workDays.includes(day) &&
        time >= v.startTime &&
        time <= v.endTime &&
        (spec === '' || v.specialization === spec),
    );

    this.availableVets.set(vets);
    this.vetHint.set(
      vets.length === 0
        ? '⚠️ No vets available for this treatment at the selected time.'
        : `✅ ${vets.length} vet(s) available`,
    );
  }

  // ── Book ───────────────────────────────────────────────────
  bookAppointment(): void {
    const pet = this.pets().find((p) => p.id === this.form.petId);
    const vet = this.availableVets().find((v) => v.id === this.form.vetId);
    if (!pet) return;

    this.saving.set(true);

    // TODO: ganti dengan API call:
    // this.appointmentService.book({
    //   date: this.form.date, time: this.form.time, petId: this.form.petId,
    //   vetId: this.form.vetId, treatmentName: this.form.treatmentName, treatmentCost: this.cost(),
    // }).subscribe({ next: () => { this.loadData(); this.closeModal(); this.saving.set(false); }, error: () => this.saving.set(false) });

    // Mock sementara
    const nextId = Math.max(0, ...this.appointments().map((a) => a.id)) + 1;
    this.appointments.update((list) => [
      {
        id: nextId,
        date: this.form.date,
        time: this.form.time,
        petName: pet.name,
        treatmentName: this.form.treatmentName,
        cost: this.cost(),
        paymentMethod: 'Pending',
        vetName: vet ? vet.name : null,
        status: 'PENDING',
      },
      ...list,
    ]);
    this.saving.set(false);
    this.closeModal();
  }

  // ── Cancel ─────────────────────────────────────────────────
  confirmCancel(): void {
    const id = this.selectedId();
    if (id === null) return;

    // TODO: ganti dengan API call:
    // this.appointmentService.cancel(id).subscribe(() => { this.loadData(); this.closeModal(); });

    this.appointments.update((list) =>
      list.map((a) => (a.id === id ? { ...a, status: 'CANCELLED' as const } : a)),
    );
    this.closeModal();
  }

   // ── Logout ─────────────────────────────────────────────────
  logout(): void {
    // TODO: clear token/session bila auth siap
    this.closeModal();
    this.router.navigate(['/home']);
  }
}