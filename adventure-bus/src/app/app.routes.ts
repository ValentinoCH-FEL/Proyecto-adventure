import { Routes } from '@angular/router';
import { IndexComponent } from './views/index/index.component';
import { SeleccionAsientoComponent } from './views/seleccion-asiento/seleccion-asiento'; // Ajusta la ruta de importación si es necesario

export const routes: Routes = [
  { path: '', component: IndexComponent },   // localhost:4200
  { path: 'index', component: IndexComponent }, // localhost:4200/index
  { path: 'seleccion-asiento/:id', component: SeleccionAsientoComponent },
  
];
