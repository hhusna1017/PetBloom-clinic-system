import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

export interface Payment {
  paymentId: number;
  appointmentId: number;
  treatmentName: string;
  amount: number;
  paymentDate: string | null;
  method: string | null; // 'Pending' | 'CASH' | 'ONLINE QR' | 'CARD' | 'ONLINE BANKING'
  staffName: string | null;
  appointmentDate?: string;
  appointmentTime?: string;
}

@Component({
  selector: 'app-staff-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './staff-payment.html',
  styleUrls: ['./staff-payment.css'],
})
export class StaffPayment implements OnInit {
  // TODO: bila backend siap, inject HttpClient / PaymentService di sini
  // constructor(private http: HttpClient, private router: Router) {}
  constructor(private router: Router) {}

  readonly methods = ['CASH', 'ONLINE QR', 'CARD', 'ONLINE BANKING'];

  payments = signal<Payment[]>([]);
  pendingPayments = computed(() =>
    this.payments().filter((p) => (p.method ?? 'Pending').trim().toLowerCase() === 'pending')
  );

  // Modal Record Payment
  showRecordModal = signal(false);
  selectedPending = signal<Payment | null>(null);
  recordMethod = '';

  // Modal Edit Payment
  editPayment = signal<Payment | null>(null);
  editMethod = '';

  ngOnInit(): void {
    this.loadPayments();
  }

  // ───────── Data ─────────
  loadPayments(): void {
    // TODO: ganti dengan API
    // this.http.get<Payment[]>('/api/payments').subscribe(res => this.payments.set(res));

    // Mock data sementara
    this.payments.set([
      { paymentId: 1, appointmentId: 101, treatmentName: 'Vaccination', amount: 80, paymentDate: '10/10/2026', method: 'CASH', staffName: 'Aisyah', appointmentDate: '10/10/2026', appointmentTime: '10:00' },
      { paymentId: 2, appointmentId: 102, treatmentName: 'Surgery', amount: 450, paymentDate: null, method: 'Pending', staffName: null, appointmentDate: '12/10/2026', appointmentTime: '14:30' },
      { paymentId: 3, appointmentId: 103, treatmentName: 'Check-up', amount: 50, paymentDate: null, method: 'Pending', staffName: null, appointmentDate: '12/10/2026', appointmentTime: '16:00' },
    ]);
  }

  isPending(p: Payment): boolean {
    return (p.method ?? 'Pending').trim().toLowerCase() === 'pending';
  }

  // ───────── Record Payment modal ─────────
  openRecordModal(): void {
    this.selectedPending.set(null);
    this.recordMethod = '';
    this.showRecordModal.set(true);
  }

  closeRecordModal(): void {
    this.showRecordModal.set(false);
  }

  selectPending(p: Payment): void {
    this.selectedPending.set(p);
  }

  saveRecord(): void {
    const p = this.selectedPending();
    if (!p) {
      alert('Please select a pending payment first.');
      return;
    }
    if (!this.recordMethod) {
      alert('Please choose a payment method.');
      return;
    }
    this.submitPayment(p.paymentId, this.recordMethod, () => this.closeRecordModal());
  }

  // ───────── Edit modal ─────────
  openEdit(p: Payment): void {
    this.editPayment.set(p);
    this.editMethod = this.isPending(p) ? '' : (p.method ?? '').toUpperCase();
  }

  closeEdit(): void {
    this.editPayment.set(null);
  }

  saveEdit(): void {
    const p = this.editPayment();
    if (!p || !this.editMethod) return;
    this.submitPayment(p.paymentId, this.editMethod, () => this.closeEdit());
  }

  // ───────── Submit (dikongsi Record & Edit) ─────────
  private submitPayment(paymentId: number, method: string, done: () => void): void {
    // TODO: ganti dengan API. Tarikh & staffId biar backend ambil
    // (tarikh dari server, staffId dari token login)
    // this.http.put(`/api/payments/${paymentId}`, { method }).subscribe({
    //   next: () => { alert('Payment recorded successfully!'); this.loadPayments(); done(); },
    //   error: (err) => alert('Error: ' + (err.error?.message ?? err.message)),
    // });

    // Mock: update local sahaja
    const today = new Date().toLocaleDateString('en-GB'); // dd/mm/yyyy
    this.payments.update((list) =>
      list.map((p) =>
        p.paymentId === paymentId ? { ...p, method, paymentDate: today, staffName: 'Staff' } : p
      )
    );
    alert('Payment recorded successfully!');
    done();
  }

// ───────── Logout modal ─────────
showLogoutModal = false;

openLogout(): void {
  this.showLogoutModal = true;
}

closeLogout(): void {
  this.showLogoutModal = false;
}

logout(): void {
  this.showLogoutModal = false;

  this.router.navigate(['/home']);
}
  }
