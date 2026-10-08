import { Routes } from '@angular/router';
import { PaymentPetOwner } from './features/payment-petOwner/payment-petOwner';
import { ProfilePetOwner } from './features/profile/profile-petOwner';

export const routes: Routes = [
  // 1. Halaan asal ke halaman login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path : 'profile', component: ProfilePetOwner },
  { path : 'payment', component: PaymentPetOwner },

  // 2. Route Login (Guna Lazy Loading supaya takkan crash)
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login-petowner').then((m) => m.Login)
  },
  {
    path: 'staff-login',
    loadComponent: () =>
      import('./features/staff-login/staff-login').then((m) => m.StaffLogin)
  },
  {
    path: 'vet-login',
    loadComponent: () =>
      import('./features/vet-login/vet-login').then((m) => m.VetLogin)
  },

  // 3. Route Registration (Milik Anda)
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

  // 4. Route Lain
  {
    path: 'home',
    loadComponent: () =>
      import('./features/home/home').then((m) => m.HomeComponent)
  },
  {
    path: 'about-us',
    loadComponent: () =>
      import('./features/about/about').then((m) => m.AboutUs)
  },
  {
    path: 'services',
    loadComponent: () =>
      import('./features/services/service').then((m) => m.Services)
  },
  {
  path: 'profile',
  loadComponent: () =>
    import('./features/profile/profile-petOwner').then((m) => m.ProfilePetOwner)
},
  {
    path: 'payment',
    loadComponent: () =>
      import('./features/payment-petOwner/payment-petOwner').then((m) => m.PaymentPetOwner)
  },

  // Catch-all
  { path: '**', redirectTo: 'login' }
];