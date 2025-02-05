import { Routes } from '@angular/router';
import { SchedulerComponent } from './scheduler/scheduler.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

//auth guard
import { authGuard } from './guards/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';



export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  {
    path: 'scheduler',
    component: SchedulerComponent,
    canActivate: [authGuard],
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  { path: 'login', component: LoginComponent },
  { path: 'signin', component: RegisterComponent },
];
