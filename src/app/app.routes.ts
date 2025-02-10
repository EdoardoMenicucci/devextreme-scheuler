import { Routes } from '@angular/router';
import { SchedulerComponent } from './scheduler/scheduler.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';

//auth guard
import { authGuard } from './guards/auth.guard';




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
    runGuardsAndResolvers: 'always',
  },
  { path: 'login', component: LoginComponent },
  { path: 'signin', component: RegisterComponent },
];
