import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';


// ============================================================
// MODELS
// ============================================================
export interface PaymentRecord {
  paymentID: number;
  appointmentID: number;
  treatmentName: string | null;
  medicationName: string | null;
  amount: number;
  paymentDate: string | null;
  method: string; // 'Pending' atau nama bank/e-wallet
}

export interface PendingBill {
  appointmentID: number;
  date: string;
  time: string;
  amount: number;
  treatmentName: string | null;
  medicationName: string | null;
}

export interface ReceiptItem {
  appointmentID: number;
  treatment: string | null;
  medication: string | null;
  amount: number;
}

// ============================================================
// COMPONENT
// ============================================================

declare const html2pdf: any;

@Component({
  selector: 'app-payment-pet-owner',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './payment-petOwner.html',
  styleUrl: './payment-petOwner.css',
  
})
export class PaymentPetOwner {
    menu = [
    { label: 'My Profile', icon: '👤', link: '/profile' },
    { label: 'My Appointments', icon: '📅', link: '/appointment' },
    { label: 'My Pets', icon: '🐾', link: '/my-pets' },
    { label: 'My Payment', icon: '💳', link: '/payment' },
  ];

  @ViewChild('receiptContent') receiptContent!: ElementRef<HTMLElement>;

  // ---------- state ----------
  payments: PaymentRecord[] = [];
  pendingBills: PendingBill[] = [];

  showPayModal = false;
  showReceipt = false;

  selectedIds = new Set<number>();
  selectedMethod = '';

  receiptItems: ReceiptItem[] = [];
  receiptTotal = 0;
  receiptMethod = '';
  receiptDate = '';

  readonly banks = [
    { label: 'Maybank2u',   icon: '🏦' },
    { label: 'CIMB Clicks', icon: '🏦' },
    { label: 'Public Bank', icon: '🏦' },
    { label: 'RHB Now',     icon: '🏦' },
    { label: 'Touch n Go',  icon: '📱' },
    { label: 'DuitNow QR',  icon: '📲' },
  ];

  constructor(private router: Router) {
    this.loadPayments();
    this.loadPendingBills();
  }

  // ============================================================
  // DATA LOADING
  // TODO: tukar mock → API bila backend siap (inject HttpClient)
  // ============================================================
  loadPayments(): void {
    // TODO: this.http.get<PaymentRecord[]>('/api/owner/payments').subscribe(r => this.payments = r);
    this.payments = [
      { paymentID: 3, appointmentID: 12, treatmentName: 'Vaccination',  medicationName: null,          amount: 80,  paymentDate: null,         method: 'Pending' },
      { paymentID: 2, appointmentID: 9,  treatmentName: 'Skin Checkup', medicationName: 'Antibiotics', amount: 120, paymentDate: '2026-09-28', method: 'Maybank2u' },
      { paymentID: 1, appointmentID: 5,  treatmentName: 'Dental Clean', medicationName: null,          amount: 150, paymentDate: '2026-09-10', method: 'Touch n Go' },
    ];
  }

  loadPendingBills(): void {
    // TODO: this.http.get<PendingBill[]>('/api/owner/payments/pending').subscribe(r => this.pendingBills = r);
    // Backend patut return: appointment COMPLETED + payment Method 'Pending' + Amount > 0
    this.pendingBills = [
      { appointmentID: 12, date: '2026-10-05', time: '10:30', amount: 80,  treatmentName: 'Vaccination',  medicationName: null },
      { appointmentID: 14, date: '2026-10-06', time: '15:00', amount: 200, treatmentName: 'Surgery Follow-up', medicationName: 'Painkiller' },
    ];
  }

  // ============================================================
  // MODAL: PAY NOW
  // ============================================================
  openPayModal(): void {
    this.selectedIds.clear();
    this.selectedMethod = '';
    this.showPayModal = true;
  }

  closePayModal(): void {
    this.showPayModal = false;
  }

  toggleItem(id: number): void {
    this.selectedIds.has(id) ? this.selectedIds.delete(id) : this.selectedIds.add(id);
  }

  isSelected(id: number): boolean {
    return this.selectedIds.has(id);
  }

  get selectedTotal(): number {
    return this.pendingBills
      .filter(b => this.selectedIds.has(b.appointmentID))
      .reduce((sum, b) => sum + b.amount, 0);
  }

  pickBank(method: string): void {
    this.selectedMethod = method;
  }

  get canConfirm(): boolean {
    return this.selectedIds.size > 0 && !!this.selectedMethod;
  }

  // ============================================================
  // SUBMIT PAYMENT
  // ============================================================
  confirmPayment(): void {
    if (!this.canConfirm) return;

    const ids = Array.from(this.selectedIds);
    const method = this.selectedMethod;

    // TODO: ganti dengan API call:
    // this.http.post<{ items: ReceiptItem[]; total: number; date: string }>(
    //   '/api/owner/payments/pay', { appointmentIds: ids, method }
    // ).subscribe(res => { ...set receipt...; this.loadPayments(); this.loadPendingBills(); });

    const today = new Date().toISOString().slice(0, 10);
    const paid = this.pendingBills.filter(b => ids.includes(b.appointmentID));

    this.receiptItems = paid.map(b => ({
      appointmentID: b.appointmentID,
      treatment: b.treatmentName,
      medication: b.medicationName,
      amount: b.amount,
    }));
    this.receiptTotal = paid.reduce((s, b) => s + b.amount, 0);
    this.receiptMethod = method;
    this.receiptDate = today;

    // mock: update local state
    this.payments = this.payments.map(p =>
      ids.includes(p.appointmentID) ? { ...p, method, paymentDate: today } : p
    );
    this.pendingBills = this.pendingBills.filter(b => !ids.includes(b.appointmentID));

    this.showPayModal = false;
    this.showReceipt = true;
  }

  closeReceipt(): void {
    this.showReceipt = false;
  }

  // ============================================================
  // PDF RECEIPT
  // Install dulu:  npm i html2pdf.js
  // ============================================================
  downloadPDF(): void {
  html2pdf()
    .set({
      margin: 0.5,
      filename: 'Resit PetBloom Clinic.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    })
    .from(this.receiptContent.nativeElement)
    .save();
}
  // ============================================================
  // LOGOUT
  // ============================================================
  confirmLogout(): void {
    if (confirm('Are you sure you want to log out?')) {
      // TODO: panggil auth service logout
      this.router.navigate(['/home']);
    }
  }
}