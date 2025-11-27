import { Routes } from '@angular/router';
import { IndexComponent } from './views/index/index.component';

export const routes: Routes = [
  { path: '', component: IndexComponent },   // localhost:4200
  { path: 'index', component: IndexComponent }, // localhost:4200/index
  
];
