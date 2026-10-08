import { Routes } from '@angular/router';
import { Login } from './features/login/login-petowner';
import { AboutUs } from './features/about/about';
import { Services } from './features/services/service';
import { StaffLogin } from './features/staff-login/staff-login';
import { VetLogin } from './features/vet-login/vet-login';
import { MyPet } from './features/my-pets/my-pet';
import { AppointmentPage } from './features/appointment/appointment';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },


  { path: 'login', component: Login },
  { path: 'about-us', component: AboutUs },
  { path: 'services', component: Services },
  { path: 'staff-login', component: StaffLogin },
  { path: 'vet-login', component: VetLogin },
  { path : 'my-pets', component: MyPet },
  { path: 'appointment', component: AppointmentPage  },

  
  {
    path: 'home',
    loadComponent: () =>
      import('./features/home/home').then((m) => m.HomeComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/register-petOwner/register-petOwner').then((m) => m.RegisterComponent)
  },
  {
    path: 'register-staff',
    loadComponent: () =>
      import('./features/register-staff/register-staff').then((m) => m.RegisterStaffComponent)
  },
  {
    path: 'register-vet',
    loadComponent: () =>
      import('./features/register-vet/register-vet').then((m) => m.RegisterVetComponent)
  },


  // ── Pet Owner Dashboard ──────────────────────────────
  {
    path: 'pets',
    loadComponent: () =>
      import('./features/my-pets/my-pet').then((m) => m.MyPet)
  },

  // ────── Appointment Dashboard ───────────────────────────

  { 
path: 'appointment', 
loadComponent: () => 
  import('./features/appointment/appointment').then((m) => m.AppointmentPage) 
},
  

  // TODO: tambah bila page lain siap
  // { path: 'profile', loadComponent: () => import('./features/my-profile/my-profile').then((m) => m.MyProfile) },
  // { path: 'appointments', loadComponent: () => import('./features/my-appointments/my-appointments').then((m) => m.MyAppointments) },
  // { path: 'payments', loadComponent: () => import('./features/my-payments/my-payments').then((m) => m.MyPayments) },

  { path: '**', redirectTo: 'login' }
];