import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { ReportComponent } from './report/report.component';
import { SearchComponent } from './search/search.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'report', component: ReportComponent, canActivate: [authGuard] },
  { path: 'gallery', component: SearchComponent, canActivate: [authGuard] },
  { path: 'search', redirectTo: 'gallery', pathMatch: 'full' }
];
