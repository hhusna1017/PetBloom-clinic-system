import { Routes } from '@angular/router';
import { Login } from './features/login/login-petowner';
import { AboutUs } from './features/about/about';
import { Services } from './features/services/service';
import { StaffLogin } from './features/staff-login/staff-login';
import { VetLogin } from './features/vet-login/vet-login';
import { PaymentPetOwner } from './features/payment-petOwner/payment-petOwner';
import { ProfilePetOwner } from './features/profile/profile-petOwner';
import { StaffAppointment } from './features/staff-appointment/staff-appointment';
import { VetTreatment } from './features/treatment/vet-treatment';
import { StaffTreatment } from './features/staff-treatment/staff-treatment';

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
  { path: 'profile', component: ProfilePetOwner },
  { path: 'payment', component: PaymentPetOwner },
  { path: 'appointment', loadComponent: () => import('./features/appointment/appointment').then((m) => m.AppointmentPage) },
  { path: 'my-pets', loadComponent: () => import('./features/my-pets/my-pet').then((m) => m.MyPet) },
  { path: 'payment-petOwner', loadComponent: () => import('./features/payment-petOwner/payment-petOwner').then((m) => m.PaymentPetOwner) },
  { path: 'profile-petOwner', loadComponent: () => import('./features/profile/profile-petOwner').then((m) => m.ProfilePetOwner) },
  { path: 'vet-treatment', loadComponent: () => import('./features/treatment/vet-treatment').then((m) => m.VetTreatment) },
  { path: 'staff-appointment', component: StaffAppointment },
  { path: 'staff-treatment', component: StaffTreatment },
  { path: 'vet-treatment', component: VetTreatment },
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