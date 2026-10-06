import { Routes } from '@angular/router';
import { Login } from './features/login/login-petowner';
import { AboutUs } from './features/about/about';
import { Services } from './features/services/service';
import { StaffLogin } from './features/staff-login/staff-login';
import { VetLogin } from './features/vet-login/vet-login';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'about-us', component: AboutUs },
  { path: 'services', component: Services },
  { path: 'staff-login', component: StaffLogin},
  { path: 'vet-login', component: VetLogin},
  { path: '**', redirectTo: 'login' },
];