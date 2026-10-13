import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';

export interface TreatmentItem {
  name: string;
  price: number;
}

export interface Treatment {
  treatmentId: number;
  appointmentId: number;
  petId: number;
  description: string;
  medicationCost: number;
  treatmentCost: number;
  vetId: number;
  vetName: string | null;
}

export interface Appointment {
  appointmentId: number;
  petId: number;
  petName: string | null;
  date: string;
  time: string;
}

export interface Vet {
  vetId: number;
  vetName: string;
}

@Component({
  selector: 'app-staff-treatment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    RouterLinkActive,
    TableModule,
    ButtonModule,
    DialogModule,
    SelectModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule,
  ],
  providers: [ConfirmationService, MessageService, DatePipe],
  templateUrl: './staff-treatment.html',
  styleUrl: './staff-treatment.css',
})
export class StaffTreatment {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private confirm = inject(ConfirmationService);
  private toast = inject(MessageService);
  private datePipe = inject(DatePipe);

  readonly treatmentList: TreatmentItem[] = [
    { name: 'General Health Check-Up', price: 30 },
    { name: 'Vaccination - Core (Dog/Cat)', price: 50 },
    { name: 'Vaccination - Rabies', price: 45 },
    { name: 'Deworming', price: 25 },
    { name: 'Flea & Tick Treatment', price: 35 },
    { name: 'Spay (Female Sterilisation)', price: 250 },
    { name: 'Neuter (Male Sterilisation)', price: 180 },
    { name: 'Dental Scaling & Polishing', price: 120 },
    { name: 'Ear Cleaning & Treatment', price: 40 },
    { name: 'Eye Infection Treatment', price: 45 },
    { name: 'Skin Allergy Treatment', price: 60 },
    { name: 'Wound Dressing & Cleaning', price: 50 },
    { name: 'X-Ray (Single View)', price: 80 },
    { name: 'Blood Test - Basic Panel', price: 70 },
    { name: 'Blood Test - Full Panel', price: 130 },
    { name: 'Microchip Implant', price: 55 },
    { name: 'Nail Trimming', price: 20 },
    { name: 'Minor Surgery', price: 300 },
    { name: 'Major Surgery', price: 800 },
    { name: 'Bird General Check-Up', price: 35 },
    { name: 'Bird Beak & Nail Trim', price: 25 },
    { name: 'Bird Wing Clipping', price: 20 },
    { name: 'Bird Respiratory Treatment', price: 65 },
    { name: 'Small Mammal Check-Up', price: 30 },
    { name: 'Rabbit Neutering', price: 200 },
    { name: 'Rabbit Dental Trim', price: 60 },
    { name: 'Small Mammal Deworming', price: 20 },
    { name: 'Reptile General Check-Up', price: 40 },
    { name: 'Reptile Parasite Treatment', price: 55 },
    { name: 'Reptile Shell/Scale Wound Treatment', price: 70 },
    { name: 'Fish Disease Diagnosis', price: 30 },
    { name: 'Fish Parasite Treatment', price: 40 },
    { name: 'Large Animal General Check-Up', price: 80 },
    { name: 'Large Animal Vaccination', price: 70 },
    { name: 'Large Animal Deworming', price: 50 },
    { name: 'Ultrasound Scan', price: 100 },
    { name: 'ECG (Heart Check)', price: 90 },
    { name: 'Nutritional & Diet Consultation', price: 40 },
    { name: 'Emergency Consultation', price: 80 },
    { name: 'Post-Surgery Follow-Up', price: 30 },
  ];

   /** TEMP: dummy data. Delete when the backend is ready. */
  treatments = signal<Treatment[]>([
    { treatmentId: 1, appointmentId: 1, petId: 1, description: 'General Health Check-Up',   medicationCost: 0, treatmentCost: 30,  vetId: 1, vetName: 'Aisyah' },
    { treatmentId: 2, appointmentId: 1, petId: 1, description: 'Vaccination - Core (Dog/Cat)', medicationCost: 0, treatmentCost: 50,  vetId: 1, vetName: 'Aisyah' },
    { treatmentId: 3, appointmentId: 2, petId: 2, description: 'Deworming',                 medicationCost: 0, treatmentCost: 25,  vetId: 2, vetName: 'Hakim' },
    { treatmentId: 4, appointmentId: 2, petId: 2, description: 'Blood Test - Basic Panel',  medicationCost: 0, treatmentCost: 70,  vetId: 2, vetName: 'Hakim' },
    { treatmentId: 5, appointmentId: 3, petId: 3, description: 'Dental Scaling & Polishing', medicationCost: 0, treatmentCost: 120, vetId: 3, vetName: 'Farah' },
    { treatmentId: 6, appointmentId: 3, petId: 3, description: 'X-Ray (Single View)',       medicationCost: 0, treatmentCost: 80,  vetId: 3, vetName: 'Farah' },
  ]);
  private nextId = 7;

  /** TEMP: dummy data so the form can be tested. Delete when the backend is ready. */
  appointments = signal<Appointment[]>([
    { appointmentId: 1, petId: 1, petName: 'Milo', date: '2026-10-12', time: '10:00' },
    { appointmentId: 2, petId: 2, petName: 'Luna', date: '2026-10-13', time: '11:30' },
    { appointmentId: 3, petId: 3, petName: 'Coco', date: '2026-10-14', time: '14:00' },
  ]);

  /** TEMP: dummy data. Delete when the backend is ready. */
  vets = signal<Vet[]>([
    { vetId: 1, vetName: 'Aisyah' },
    { vetId: 2, vetName: 'Hakim' },
    { vetId: 3, vetName: 'Farah' },
  ]);

  dialogVisible = false;
  editingId = signal<number | null>(null);

  form = this.fb.group({
    appointmentId: this.fb.control<number | null>(null, Validators.required),
    treatmentName: this.fb.control<string | null>(null, Validators.required),
    vetId: this.fb.control<number | null>(null, Validators.required),
  });

  appointmentOptions = computed(() =>
    this.appointments().map((a) => ({
      label: `#${a.appointmentId} — ${a.petName ?? 'N/A'} (${this.datePipe.transform(a.date, 'dd/MM/yyyy')})`,
      value: a.appointmentId,
    }))
  );

  treatmentOptions = this.treatmentList.map((t) => ({
    label: `${t.name} — RM ${t.price.toFixed(2)}`,
    value: t.name,
  }));

  vetOptions = computed(() =>
    this.vets().map((v) => ({
      label: `DR. ${v.vetName} (ID ${v.vetId})`,
      value: v.vetId,
    }))
  );

  /** Pet ID is auto-filled from the selected appointment */
  get petId(): number | null {
    const id = this.form.controls.appointmentId.value;
    return this.appointments().find((a) => a.appointmentId === id)?.petId ?? null;
  }

  /** Cost is auto-filled from the selected treatment */
  get cost(): number {
    const name = this.form.controls.treatmentName.value;
    return this.treatmentList.find((t) => t.name === name)?.price ?? 0;
  }

  totalCost(t: Treatment): number {
    return Number(t.medicationCost) + Number(t.treatmentCost);
  }

  openAddDialog(): void {
    this.editingId.set(null);
    this.form.reset();
    this.dialogVisible = true;
  }

  openEditDialog(t: Treatment): void {
    this.editingId.set(t.treatmentId);
    this.form.setValue({
      appointmentId: t.appointmentId,
      treatmentName: t.description,
      vetId: t.vetId,
    });
    this.dialogVisible = true;
  }

  save(): void {
    if (this.form.invalid) return;

    const v = this.form.getRawValue();
    const vet = this.vets().find((x) => x.vetId === v.vetId);
    const editing = this.editingId();

    const record: Treatment = {
      treatmentId: editing ?? this.nextId++,
      appointmentId: v.appointmentId!,
      petId: this.petId!,
      description: v.treatmentName!,
      medicationCost: 0,
      treatmentCost: this.cost,
      vetId: v.vetId!,
      vetName: vet?.vetName ?? null,
    };

    if (editing) {
      this.treatments.update((list) => list.map((t) => (t.treatmentId === editing ? record : t)));
    } else {
      this.treatments.update((list) => [...list, record]);
    }

    this.toast.add({
      severity: 'success',
      summary: 'Successful!',
      detail: editing ? 'Treatment updated!' : 'Treatment successfully saved!',
    });
    this.dialogVisible = false;
  }

  confirmDelete(t: Treatment): void {
    this.confirm.confirm({
      message: 'Delete this treatment record?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.treatments.update((list) => list.filter((x) => x.treatmentId !== t.treatmentId));
        this.toast.add({ severity: 'success', summary: 'Successful!', detail: 'Record deleted' });
      },
    });
  }

  confirmLogout(): void {
    this.confirm.confirm({
      message: 'Are you sure you want to log out?',
      header: 'Logout',
      icon: 'pi pi-sign-out',
      accept: () => this.router.navigate(['/home']),
    });
  }
}