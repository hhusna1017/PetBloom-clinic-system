import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink} from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';

// ───────────────────────── Types ─────────────────────────
export interface Medication {
  id: number;
  name: string;
  cost: number;
}

export interface PendingAppointment {
  appointmentId: string;
  petName: string;
  ownerName: string;
  date: string;
  time: string;
  status: string;
  serviceName: string | null;
}

export interface AppointmentDetail {
  appointmentId: string;
  date: string;
  time: string;
  petName: string;
  typeOfPet: string;
  breed: string;
  petAge: number | null;
  ownerName: string;
  serviceType: string | null;
  serviceCost: number | null;
}

export interface TreatmentHistory {
  appointmentId: string;
  petName: string;
  description: string;
  medicationName: string | null;
  medicationCost: number;
  treatmentCost: number;
}

export interface SaveTreatmentPayload {
  appointmentId: string;
  description: string;
  medicationName: string;
  medicationCost: number;
}

// ───────────────────── Medications list ─────────────────────
// TODO: bila backend siap, boleh tukar jadi API (GET /medications?treatment=...)
const m = (id: number, name: string, cost: number): Medication => ({ id, name, cost });

const MEDICATIONS_BY_TREATMENT: Record<string, Medication[]> = {
  'General Health Check-Up': [
    m(40, 'Saline Solution 0.9% - 100ml', 15),
    m(44, 'Vitamin B Complex Injection - 1ml', 25),
    m(41, 'Iodine Antiseptic 5% - 30ml', 18),
  ],
  'Vaccination - Core (Dog/Cat)': [
    m(44, 'Vitamin B Complex Injection - 1ml', 25),
    m(40, 'Saline Solution 0.9% - 100ml', 15),
    m(47, 'Epinephrine 1mg/ml - 1ml (emergency)', 55),
  ],
  'Vaccination - Rabies': [
    m(44, 'Vitamin B Complex Injection - 1ml', 25),
    m(47, 'Epinephrine 1mg/ml - 1ml (emergency)', 55),
    m(40, 'Saline Solution 0.9% - 100ml', 15),
  ],
  'Large Animal Vaccination': [
    m(44, 'Vitamin B Complex Injection - 1ml', 25),
    m(47, 'Epinephrine 1mg/ml - 1ml (emergency)', 55),
    m(46, 'Sodium Chloride 0.9% - 500ml', 28),
  ],
  'Deworming': [
    m(6, 'Fenbendazole 100mg/ml - 10ml', 28),
    m(16, 'Praziquantel 50mg/5ml - 30ml', 42),
    m(8, 'Metronidazole 250mg - 20 tablets', 22),
  ],
  'Small Mammal Deworming': [
    m(39, 'Fenbendazole 100mg/ml - 10ml (small)', 28),
    m(38, 'Metronidazole 50mg/ml - 10ml', 25),
  ],
  'Large Animal Deworming': [
    m(6, 'Fenbendazole 100mg/ml - 10ml', 28),
    m(16, 'Praziquantel 50mg/5ml - 30ml', 42),
  ],
  'Flea & Tick Treatment': [
    m(49, 'Hydrocortisone Cream 1% - 15g', 22),
    m(41, 'Iodine Antiseptic 5% - 30ml', 18),
    m(48, 'Antibiotic Ointment - 20g', 18.5),
  ],
  'Spay (Female Sterilisation)': [
    m(47, 'Epinephrine 1mg/ml - 1ml', 55),
    m(45, 'Dextrose 5% Injection - 500ml', 35),
    m(46, 'Sodium Chloride 0.9% - 500ml', 28),
    m(1, 'Amoxicillin 250mg/5ml - 30ml', 35),
    m(10, 'Tramadol 50mg - 20 tablets', 40),
  ],
  'Neuter (Male Sterilisation)': [
    m(47, 'Epinephrine 1mg/ml - 1ml', 55),
    m(45, 'Dextrose 5% Injection - 500ml', 35),
    m(46, 'Sodium Chloride 0.9% - 500ml', 28),
    m(1, 'Amoxicillin 250mg/5ml - 30ml', 35),
    m(10, 'Tramadol 50mg - 20 tablets', 40),
  ],
  'Rabbit Neutering': [
    m(24, 'Metacam 1.5mg/ml - 10ml', 48),
    m(23, 'Enrofloxacin 10mg/ml - 10ml', 35),
    m(46, 'Sodium Chloride 0.9% - 500ml', 28),
  ],
  'Minor Surgery': [
    m(47, 'Epinephrine 1mg/ml - 1ml', 55),
    m(1, 'Amoxicillin 250mg/5ml - 30ml', 35),
    m(10, 'Tramadol 50mg - 20 tablets', 40),
    m(40, 'Saline Solution 0.9% - 100ml', 15),
    m(42, 'Cetrimide Antiseptic Cream 5% - 25g', 20),
  ],
  'Major Surgery': [
    m(47, 'Epinephrine 1mg/ml - 1ml', 55),
    m(45, 'Dextrose 5% Injection - 500ml', 35),
    m(46, 'Sodium Chloride 0.9% - 500ml', 28),
    m(20, 'Tramadol 100mg - 20 tablets', 60),
    m(11, 'Amoxicillin 250mg/5ml - 60ml', 40),
    m(15, 'Cephalexin 500mg - 20 capsules', 48),
  ],
  'Dental Scaling & Polishing': [
    m(1, 'Amoxicillin 250mg/5ml - 30ml', 35),
    m(41, 'Iodine Antiseptic 5% - 30ml', 18),
    m(40, 'Saline Solution 0.9% - 100ml', 15),
  ],
  'Rabbit Dental Trim': [
    m(24, 'Metacam 1.5mg/ml - 10ml', 48),
    m(40, 'Saline Solution 0.9% - 100ml', 15),
  ],
  'Ear Cleaning & Treatment': [
    m(7, 'Doxycycline 50mg - 20 capsules', 38),
    m(4, 'Itraconazole 10mg/ml - 10ml', 45),
    m(2, 'Neomycin Cream 1% - 15g', 25),
    m(41, 'Iodine Antiseptic 5% - 30ml', 18),
  ],
  'Eye Infection Treatment': [
    m(5, 'Cephalexin 250mg - 20 capsules', 32),
    m(2, 'Neomycin Cream 1% - 15g', 25),
    m(40, 'Saline Solution 0.9% - 100ml', 15),
  ],
  'Skin Allergy Treatment': [
    m(49, 'Hydrocortisone Cream 1% - 15g', 22),
    m(22, 'Diphenhydramine 25mg - 20 tablets', 25),
    m(19, 'Ketoconazole 200mg - 20 tablets', 55),
    m(4, 'Itraconazole 10mg/ml - 10ml', 45),
    m(48, 'Antibiotic Ointment - 20g', 18.5),
  ],
  'Wound Dressing & Cleaning': [
    m(43, 'Hydrogen Peroxide 3% - 100ml', 12),
    m(50, 'Povidone Iodine 10% - 100ml', 16),
    m(42, 'Cetrimide Antiseptic Cream 5% - 25g', 20),
    m(48, 'Antibiotic Ointment - 20g', 18.5),
    m(1, 'Amoxicillin 250mg/5ml - 30ml', 35),
  ],
  'X-Ray (Single View)': [
    m(40, 'Saline Solution 0.9% - 100ml', 15),
    m(44, 'Vitamin B Complex Injection - 1ml', 25),
  ],
  'Blood Test - Basic Panel': [m(40, 'Saline Solution 0.9% - 100ml', 15)],
  'Blood Test - Full Panel': [
    m(40, 'Saline Solution 0.9% - 100ml', 15),
    m(45, 'Dextrose 5% Injection - 500ml', 35),
  ],
  'Ultrasound Scan': [m(40, 'Saline Solution 0.9% - 100ml', 15)],
  'ECG (Heart Check)': [
    m(21, 'Enalapril 2.5mg - 30 tablets', 48),
    m(40, 'Saline Solution 0.9% - 100ml', 15),
  ],
  'Microchip Implant': [
    m(41, 'Iodine Antiseptic 5% - 30ml', 18),
    m(40, 'Saline Solution 0.9% - 100ml', 15),
  ],
  'Nail Trimming': [m(41, 'Iodine Antiseptic 5% - 30ml', 18)],
  'Bird General Check-Up': [
    m(29, 'Enrofloxacin 10mg/ml - 10ml', 38),
    m(44, 'Vitamin B Complex Injection - 1ml', 25),
  ],
  'Bird Beak & Nail Trim': [
    m(41, 'Iodine Antiseptic 5% - 30ml', 18),
    m(40, 'Saline Solution 0.9% - 100ml', 15),
  ],
  'Bird Wing Clipping': [m(41, 'Iodine Antiseptic 5% - 30ml', 18)],
  'Bird Respiratory Treatment': [
    m(31, 'Doxycycline Hyclate 50mg/5ml', 40),
    m(29, 'Enrofloxacin 10mg/ml - 10ml', 38),
    m(30, 'Nystatin 100,000 IU/ml - 15ml', 35),
  ],
  'Small Mammal Check-Up': [
    m(37, 'Enrofloxacin 10mg/ml - 10ml', 35),
    m(44, 'Vitamin B Complex Injection - 1ml', 25),
  ],
  'Reptile General Check-Up': [
    m(33, 'Enrofloxacin 10mg/ml - 10ml', 38),
    m(34, 'Vitamin A Injection - 10ml', 45),
  ],
  'Reptile Parasite Treatment': [
    m(32, 'Praziquantel 50mg/ml - 10ml', 33),
    m(33, 'Enrofloxacin 10mg/ml - 10ml', 38),
  ],
  'Reptile Shell/Scale Wound Treatment': [
    m(50, 'Povidone Iodine 10% - 100ml', 16),
    m(36, 'Itraconazole 10mg/ml - 10ml', 48),
    m(48, 'Antibiotic Ointment - 20g', 18.5),
  ],
  'Fish Disease Diagnosis': [m(40, 'Saline Solution 0.9% - 100ml', 15)],
  'Fish Parasite Treatment': [m(32, 'Praziquantel 50mg/ml - 10ml', 33)],
  'Large Animal General Check-Up': [
    m(44, 'Vitamin B Complex Injection - 1ml', 25),
    m(46, 'Sodium Chloride 0.9% - 500ml', 28),
  ],
  'Nutritional & Diet Consultation': [m(44, 'Vitamin B Complex Injection - 1ml', 25)],
  'Emergency Consultation': [
    m(47, 'Epinephrine 1mg/ml - 1ml', 55),
    m(45, 'Dextrose 5% Injection - 500ml', 35),
    m(46, 'Sodium Chloride 0.9% - 500ml', 28),
    m(40, 'Saline Solution 0.9% - 100ml', 15),
  ],
  'Post-Surgery Follow-Up': [
    m(1, 'Amoxicillin 250mg/5ml - 30ml', 35),
    m(10, 'Tramadol 50mg - 20 tablets', 40),
    m(48, 'Antibiotic Ointment - 20g', 18.5),
    m(40, 'Saline Solution 0.9% - 100ml', 15),
  ],
};

@Component({
  selector: 'app-vet-treatment',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, RouterLink],
  templateUrl: './vet-treatment.html',
  styleUrl: './vet-treatment.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VetTreatment {
  private readonly router = inject(Router);

  // ── Logout popup ──
  readonly showLogoutModal = signal(false);

  // ── Vet info (TODO: ambil dari AuthService / session bila backend siap) ──
  readonly vetName = signal('Demo');
  readonly vetId = signal('V001');

  // ── Data lists ──
  // TODO: ganti mock dengan API: GET /vets/{vetId}/appointments?status=PENDING
  readonly pendingAppointments = signal<PendingAppointment[]>([
    {
      appointmentId: 'A001',
      petName: 'Mimi',
      ownerName: 'Aisyah',
      date: '2026-10-09',
      time: '10:00',
      status: 'PENDING',
      serviceName: 'Skin Allergy Treatment',
    },
    {
      appointmentId: 'A002',
      petName: 'Bruno',
      ownerName: 'Hafiz',
      date: '2026-10-09',
      time: '11:30',
      status: 'PENDING',
      serviceName: 'Deworming',
    },
  ]);

  // TODO: ganti mock dengan API: GET /vets/{vetId}/treatments
  readonly history = signal<TreatmentHistory[]>([]);

  // ── Form / selection state ──
  readonly showTreatmentForm = signal(false);
  readonly loadingDetail = signal(false);
  readonly selectedApptId = signal('');
  readonly detail = signal<AppointmentDetail | null>(null);
  readonly description = signal('');
  readonly selectedMedId = signal<number | null>(null);

  // ── Modal state ──
  readonly showModal = signal(false);
  readonly modalBill = signal({ service: 0, medication: 0, total: 0 });

  // ── Derived values ──
  readonly serviceName = computed(() => this.detail()?.serviceType ?? null);
  readonly serviceFee = computed(() => this.detail()?.serviceCost ?? 0);

  /** Ubat ikut jenis rawatan. Kalau tiada service, tunjuk semua (unik). */
  readonly filteredByService = computed(() => {
    const name = this.serviceName();
    return name ? (MEDICATIONS_BY_TREATMENT[name] ?? null) : null;
  });

  readonly medications = computed<Medication[]>(() => {
    const filtered = this.filteredByService();
    if (filtered && filtered.length > 0) return filtered;

    const seen = new Map<number, Medication>();
    Object.values(MEDICATIONS_BY_TREATMENT).forEach((list) =>
      list.forEach((med) => {
        if (!seen.has(med.id)) seen.set(med.id, med);
      }),
    );
    return [...seen.values()];
  });

  readonly selectedMedication = computed(
    () => this.medications().find((med) => med.id === this.selectedMedId()) ?? null,
  );
  readonly medicationCost = computed(() => this.selectedMedication()?.cost ?? 0);
  readonly totalBill = computed(() => this.serviceFee() + this.medicationCost());

  // ───────────────────────── Actions ─────────────────────────
  diagnosePatient(apptId: string): void {
    this.showTreatmentForm.set(true);
    this.selectedApptId.set(apptId);
    this.description.set('');
    this.selectedMedId.set(null);
    this.detail.set(null);
    this.loadingDetail.set(true);

    // TODO: ganti dengan HttpClient: GET /appointments/{apptId}/detail
    // this.http.get<AppointmentDetail>(`/api/appointments/${apptId}/detail`).subscribe({...})
    setTimeout(() => {
      const appt = this.pendingAppointments().find((a) => a.appointmentId === apptId);
      if (!appt) {
        this.loadingDetail.set(false);
        alert('Could not load appointment details.');
        return;
      }
      this.detail.set({
        appointmentId: appt.appointmentId,
        date: appt.date,
        time: appt.time,
        petName: appt.petName,
        typeOfPet: 'Cat',
        breed: 'Domestic Shorthair',
        petAge: 3,
        ownerName: appt.ownerName,
        serviceType: appt.serviceName,
        serviceCost: 80,
      });
      this.loadingDetail.set(false);
    }, 400);
  }

  cancelTreatment(): void {
    this.showTreatmentForm.set(false);
  }

  submitTreatment(): void {
    const med = this.selectedMedication();
    if (!med || !this.description().trim()) return;

    const payload: SaveTreatmentPayload = {
      appointmentId: this.selectedApptId(),
      description: this.description().trim(),
      medicationName: med.name,
      medicationCost: med.cost,
    };

    // TODO: ganti dengan HttpClient: POST /treatments  (backend: insert treatment,
    // update payment total + status Pending, mark appointment COMPLETED)
    const service = this.serviceFee();
    const total = service + med.cost;

    this.history.update((list) => [
      {
        appointmentId: payload.appointmentId,
        petName: this.detail()?.petName ?? '',
        description: payload.description,
        medicationName: payload.medicationName,
        medicationCost: payload.medicationCost,
        treatmentCost: service,
      },
      ...list,
    ]);
    this.pendingAppointments.update((list) =>
      list.filter((a) => a.appointmentId !== payload.appointmentId),
    );

    this.modalBill.set({ service, medication: med.cost, total });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.showTreatmentForm.set(false);
  }

  openLogoutModal(): void {
    this.showLogoutModal.set(true);
  }

  cancelLogout(): void {
    this.showLogoutModal.set(false);
  }

  confirmLogout(): void {
    // TODO: panggil AuthService.logout() / buang token (localStorage / sessionStorage) bila backend siap
    this.showLogoutModal.set(false);
    this.router.navigate(['/vet-login']);
  }

  totalBilled(h: TreatmentHistory): number {
    return h.medicationCost + h.treatmentCost;
  }
}