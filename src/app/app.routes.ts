import { Routes } from '@angular/router';
import { SchedulerComponent } from './pages/scheduler/scheduler.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

//auth guard
import { authGuard } from './guards/auth.guard';
import { ContactComponent } from './pages/contact/contact.component';




export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  {
    path: 'scheduler',
    component: SchedulerComponent,
    canActivate: [authGuard],
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'contact',
    component: ContactComponent,
    canActivate: [authGuard],
    runGuardsAndResolvers: 'always',
  },
  { path: 'login', component: LoginComponent },
  { path: 'signin', component: RegisterComponent },
];
