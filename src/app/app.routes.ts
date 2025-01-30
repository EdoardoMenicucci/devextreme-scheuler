import { Routes } from '@angular/router';
import { SchedulerComponent } from './scheduler/scheduler/scheduler.component';
import { HomeComponent } from './home/home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';


export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'scheduler', component: SchedulerComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signin', component: RegisterComponent }
];
