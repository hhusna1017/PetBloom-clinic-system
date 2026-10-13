import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of, catchError } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

export type AppointmentStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
  appointmentId: number;
  petId: number;
  petName?: string | null;
  date: string;           // yyyy-MM-dd
  time: string;           // HH:mm:ss
  ownerId: number;
  vetId?: number | null;
  staffId?: number | null;
  status: AppointmentStatus;
}

@Component({
  selector: 'app-staff-appointment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    RouterLinkActive,
    ButtonModule,
    TableModule,
    DialogModule,
    InputNumberModule,
    InputTextModule,
    DatePickerModule,
    SelectModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './staff-appointment.html',
  styleUrl: './staff-appointment.css',
})
export class StaffAppointment implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private confirmation = inject(ConfirmationService);
  private toast = inject(MessageService);

  // TODO: tukar ikut URL backend awak
  private readonly API = '/api';

  // ⚠️ Letak false bila backend dah siap. Bila true, semua data guna mock dalam memory.
  private readonly USE_MOCK = true;

  private mockPets: Record<number, string> = { 1: 'Mochi', 2: 'Bella', 3: 'Luna', 4: 'Max' };
  private mockAppointments: Appointment[] = [
    { appointmentId: 1, petId: 1, petName: 'Mochi', date: '2026-10-12', time: '09:30:00', ownerId: 1, vetId: 1, staffId: 1, status: 'PENDING' },
    { appointmentId: 2, petId: 2, petName: 'Bella', date: '2026-10-10', time: '14:00:00', ownerId: 2, vetId: 2, staffId: 1, status: 'COMPLETED' },
    { appointmentId: 3, petId: 3, petName: 'Luna',  date: '2026-10-08', time: '11:15:00', ownerId: 3, vetId: 1, staffId: 1, status: 'CANCELLED' },
  ];
  private mockNextId = 4;

  appointments = signal<Appointment[]>([]);
  loading = signal(false);
  saving = signal(false);
  petName = signal('');
  editingId = signal<number | null>(null);

  dialogVisible = false;
  staffId = 0;

  statusOptions = [
    { label: 'Pending', value: 'PENDING' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  form = this.fb.group({
    petId: [null as number | null, Validators.required],
    ownerId: [null as number | null, Validators.required],
    vetId: [null as number | null, Validators.required],
    date: [null as Date | null, Validators.required],
    time: [null as Date | null, Validators.required],
    status: ['PENDING' as AppointmentStatus, Validators.required],
  });

  private petLookup$ = new Subject<number | null>();

  ngOnInit(): void {
    if (this.USE_MOCK && !sessionStorage.getItem('staff_id')) {
      sessionStorage.setItem('staff_id', '1'); // staff palsu untuk mode mock
    }
    const id = sessionStorage.getItem('staff_id');
    if (!id) {
      this.toast.add({ severity: 'error', summary: 'Access Denied', detail: 'Please login first.' });
      this.router.navigate(['/staff-login']);
      return;
    }
    this.staffId = Number(id);

    // Auto-fill pet name (debounced)
    this.petLookup$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((petId) =>
          this.USE_MOCK
            ? of({ name: petId ? this.mockPets[petId] ?? '' : '' })
            : petId
            ? this.http
                .get<{ name?: string }>(`${this.API}/pets/${petId}`)
                .pipe(catchError(() => of({ name: '' })))
            : of({ name: '' })
        )
      )
      .subscribe((res) => this.petName.set(res.name || 'Not found'));

    this.loadAppointments();
  }

  // ── Load ──────────────────────────────────────────────
  loadAppointments(): void {
    if (this.USE_MOCK) {
      this.appointments.set([...this.mockAppointments]);
      return;
    }
    this.loading.set(true);
    this.http.get<Appointment[]>(`${this.API}/appointments`).subscribe({
      next: (data) => {
        this.appointments.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.add({ severity: 'error', summary: 'Error', detail: err?.error?.message ?? 'Failed to load appointments.' });
      },
    });
  }

  // ── Dialog ────────────────────────────────────────────
  openAddDialog(): void {
    this.editingId.set(null);
    this.petName.set('');
    this.form.reset({ status: 'PENDING' });
    this.dialogVisible = true;
  }

  openEditDialog(row: Appointment): void {
    this.editingId.set(row.appointmentId);
    this.petName.set(row.petName ?? '');
    this.form.setValue({
      petId: row.petId,
      ownerId: row.ownerId,
      vetId: row.vetId ?? null,
      date: new Date(row.date + 'T00:00:00'),
      time: this.parseTime(row.time),
      status: (row.status?.toUpperCase() as AppointmentStatus) ?? 'PENDING',
    });
    this.dialogVisible = true;
  }

  onPetIdChange(value: number | null): void {
    this.petLookup$.next(value);
  }

  // ── Save (add + update) ───────────────────────────────
  save(): void {
    if (this.form.invalid) return;
    const v = this.form.value;

    const payload = {
      petId: v.petId,
      ownerId: v.ownerId,
      vetId: v.vetId,
      date: this.toDateString(v.date!),
      time: this.toTimeString(v.time!),
      status: v.status,
      staffId: this.staffId, // sentiasa stamp staff yang buat perubahan
    };

    const id = this.editingId();

    if (this.USE_MOCK) {
      const record: Appointment = {
        appointmentId: id ?? this.mockNextId++,
        petId: payload.petId!,
        petName: this.mockPets[payload.petId!] ?? null,
        date: payload.date,
        time: payload.time,
        ownerId: payload.ownerId!,
        vetId: payload.vetId,
        staffId: payload.staffId,
        status: payload.status!,
      };
      this.mockAppointments = id
        ? this.mockAppointments.map((a) => (a.appointmentId === id ? record : a))
        : [...this.mockAppointments, record];
      this.dialogVisible = false;
      this.toast.add({
        severity: 'success',
        summary: 'Success',
        detail: `Appointment successfully updated! (Staff ID recorded: ${this.staffId})`,
      });
      this.loadAppointments();
      return;
    }

    const request$ = id
      ? this.http.put(`${this.API}/appointments/${id}`, payload)
      : this.http.post(`${this.API}/appointments`, payload);

    this.saving.set(true);
    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible = false;
        this.toast.add({
          severity: 'success',
          summary: 'Success',
          detail: `Appointment successfully ${id ? 'updated' : 'saved'}! (Staff ID recorded: ${this.staffId})`,
        });
        this.loadAppointments();
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.add({ severity: 'error', summary: id ? 'Update failed' : 'Failed', detail: err?.error?.message ?? 'Request failed.' });
      },
    });
  }

  // ── Delete ────────────────────────────────────────────
  confirmDelete(row: Appointment): void {
    this.confirmation.confirm({
      header: 'Delete Appointment',
      message: `Are you sure you want to delete Appointment #${row.appointmentId}? This cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { severity: 'danger', label: 'Delete' },
      rejectButtonProps: { severity: 'secondary', outlined: true, label: 'Cancel' },
      accept: () => {
        if (this.USE_MOCK) {
          this.mockAppointments = this.mockAppointments.filter((a) => a.appointmentId !== row.appointmentId);
          this.toast.add({ severity: 'success', summary: 'Deleted', detail: 'Appointment and related records deleted successfully.' });
          this.loadAppointments();
          return;
        }
        // Backend yang handle cascade delete (payment, treatment) sebelum appointment
        this.http.delete(`${this.API}/appointments/${row.appointmentId}`).subscribe({
          next: () => {
            this.toast.add({ severity: 'success', summary: 'Deleted', detail: 'Appointment and related records deleted successfully.' });
            this.loadAppointments();
          },
          error: (err) =>
            this.toast.add({ severity: 'error', summary: 'Delete failed', detail: err?.error?.message ?? 'Request failed.' }),
        });
      },
    });
  }

  // ── Logout ────────────────────────────────────────────
  confirmLogout(): void {
    this.confirmation.confirm({
      header: 'Logout',
      message: 'Are you sure you want to log out?',
      icon: 'pi pi-sign-out',
      accept: () => {
        sessionStorage.removeItem('staff_id');
        this.router.navigate(['/home']);
      },
    });
  }

  // ── Helpers ───────────────────────────────────────────
  statusSeverity(status: string): 'warn' | 'success' | 'danger' | 'secondary' {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'warn';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'danger';
      default: return 'secondary';
    }
  }

  formatTime(time: string): string {
    const d = this.parseTime(time);
    return d.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  private parseTime(time: string): Date {
    const [h, m] = (time ?? '00:00').split(':').map(Number);
    const d = new Date();
    d.setHours(h || 0, m || 0, 0, 0);
    return d;
  }

  private toDateString(d: Date): string {
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }

  private toTimeString(d: Date): string {
    const p = (n: number) => String(n).padStart(2, '0');
    return `${p(d.getHours())}:${p(d.getMinutes())}:00`;
  }
}