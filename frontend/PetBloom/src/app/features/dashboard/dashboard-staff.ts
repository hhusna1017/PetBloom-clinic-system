import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
// import { HttpClient } from '@angular/common/http'; // <- uncomment bila API dah siap

export interface Appointment {
  id: number;
  time: string; // 'HH:mm:ss' (sama macam column Time dalam DB)
  petName: string | null;
  ownerName: string | null;
  vetName: string | null;
  status: string;
}

export interface DashboardStats {
  appointmentCount: number;
  petCount: number;
  revenue: number;
}

@Component({
  selector: 'app-staff-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './dashboard-staff.html',
  styleUrl: './dashboard-staff.css',
})
export class StaffDashboard implements OnInit {
  /** Tukar jadi false bila backend + API dah siap */
  private readonly useMock = true;

  menuItems = [
    { label: 'Dashboard', path: '/dashboard-staff', icon: '🏠' },
    { label: 'Appointment', path: '/staff/appointment', icon: '📅' },
    { label: 'Pet & Owner', path: '/staff-petowner', icon: '🐶' },
    { label: 'Treatment', path: '/staff/treatment', icon: '💉' },
    { label: 'Payment', path: '/staff-payment', icon: '💳' },
  ];

  // yyyy-MM-dd, default hari ini ikut waktu Malaysia
  selectedDate = this.todayMY();

  apptCount = 0;
  petCount = 0;
  revenue = 0;
  appointments: Appointment[] = [];

  loading = false;
  error = '';

  /** Logout confirmation modal */
  showLogoutModal = false;

  // constructor(private http: HttpClient, private router: Router) {}
  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  get isToday(): boolean {
    return this.selectedDate === this.todayMY();
  }

  onSearch(): void {
    this.loadDashboard();
  }

  resetToToday(): void {
    this.selectedDate = this.todayMY();
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = '';

    if (this.useMock) {
      // simulate network delay
      setTimeout(() => {
        const mock = this.getMockData(this.selectedDate);
        this.appointments = mock.appointments;
        this.apptCount = mock.appointments.length;
        this.petCount = mock.stats.petCount;
        this.revenue = mock.stats.revenue;
        this.loading = false;
      }, 300);
      return;
    }

    /* ── Bila API dah siap, guna ni ──
    this.http
      .get<DashboardStats>('/api/staff/dashboard/stats', { params: { date: this.selectedDate } })
      .subscribe({
        next: (s) => {
          this.apptCount = s.appointmentCount;
          this.petCount = s.petCount;
          this.revenue = s.revenue ?? 0;
        },
        error: () => (this.error = 'Failed to load stats.'),
      });

    this.http
      .get<Appointment[]>('/api/staff/appointments', { params: { date: this.selectedDate } })
      .subscribe({
        next: (list) => {
          this.appointments = list;
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load appointments.';
          this.loading = false;
        },
      });
    */
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
    // TODO: panggil API logout / clear token, contoh:
    // localStorage.removeItem('token');
    this.router.navigate(['/home']);
  }

  /** 'HH:mm:ss' -> 'h:mm AM/PM' */
  formatTime(time: string): string {
    if (!time) return '';
    const [h, m] = time.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
  }

  badgeClass(status: string): string {
    switch ((status || '').toLowerCase()) {
      case 'done':
      case 'completed':
        return 'bg-emerald-100 text-emerald-800';
      case 'waiting':
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800'; // upcoming
    }
  }

  private todayMY(): string {
    // en-CA => yyyy-MM-dd
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kuala_Lumpur' });
  }

  private getMockData(date: string): { stats: DashboardStats; appointments: Appointment[] } {
    const all: Appointment[] = [
      { id: 1, time: '09:00:00', petName: 'Milo', ownerName: 'Ahmad Faiz', vetName: 'Dr. Aisyah', status: 'Done' },
      { id: 2, time: '10:30:00', petName: 'Luna', ownerName: 'Siti Nurhaliza', vetName: 'Dr. Aisyah', status: 'Waiting' },
      { id: 3, time: '11:15:00', petName: 'Bruno', ownerName: 'Lim Wei Jie', vetName: 'Dr. Hakim', status: 'Upcoming' },
      { id: 4, time: '14:00:00', petName: 'Kiki', ownerName: 'Priya Devi', vetName: null, status: 'Cancelled' },
      { id: 5, time: '15:45:00', petName: null, ownerName: null, vetName: 'Dr. Hakim', status: 'Upcoming' },
    ];

    // Mock: hari ini ada data, tarikh lain kosong / sikit
    const day = Number(date.slice(-2));
    const appointments = date === this.todayMY() ? all : day % 2 === 0 ? all.slice(0, 2) : [];

    return { stats: { appointmentCount: appointments.length, petCount: 48, revenue: 12450 }, appointments };
  }
}