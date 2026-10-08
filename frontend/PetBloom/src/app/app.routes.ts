import { Routes } from '@angular/router';
<<<<<<< HEAD
import { PaymentPetOwner } from './features/payment-petOwner/payment-petOwner';
import { ProfilePetOwner } from './features/profile/profile-petOwner';
=======
>>>>>>> 68794e07d837f9a241efa340bd3eee514abdb9bd

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home').then((m) => m.HomeComponent),
  },
  { path: 'login', component: Login },
  { path: 'about-us', component: AboutUs },
  { path: 'services', component: Services },
  { path: 'staff-login', component: StaffLogin },
  { path: 'vet-login', component: VetLogin },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/register-petOwner/register-petOwner').then((m) => m.RegisterComponent),
  },
  {
    path: 'register-staff',
    loadComponent: () =>
      import('./features/register-staff/register-staff').then((m) => m.RegisterStaffComponent),
  },
  {
    path: 'register-vet',
    loadComponent: () =>
      import('./features/register-vet/register-vet').then((m) => m.RegisterVetComponent),
  },
  { path: '**', redirectTo: '' },
];