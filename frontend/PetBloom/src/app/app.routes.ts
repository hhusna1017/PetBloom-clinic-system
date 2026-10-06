import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'about-us', component: AboutUs },
  { path: 'services', component: Services },
  { path: 'staff-login', component: StaffLogin},
  { path: 'vet-login', component: VetLogin},
  { path: '**', redirectTo: 'login' },

export const routes: Routes = [
  {
    path: '',
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
       import('./features/register-staff/register-staff').then((m) => m.RegisterStaffComponent),
   },
   {
     path: 'register-vet',
     loadComponent: () =>
       import('./features/register-vet/register-vet').then((m) => m.RegisterVetComponent),
   },
  
];