import { Routes } from '@angular/router';
import { IndexComponent } from './views/index/index.component';
import { SeleccionAsientoComponent } from './views/seleccion-asiento/seleccion-asiento';
import { RegistroPasajeroComponent } from './views/registro-pasajero/registro-pasajero';
import { PagoComponent } from './views/pago/pago';
import { ConfirmacionComponent } from './views/confirmacion/confirmacion';
import { AutogestionComponent } from './views/autogestion/autogestion';
import { AdminLoginComponent } from './views/admin-login/admin-login';
import { PanelAdministradorComponent } from './views/panel-administrador/panel-administrador';

export const routes: Routes = [
  { path: '', component: IndexComponent },   // localhost:4200
  { path: 'index', component: IndexComponent }, // localhost:4200/index
  
  // Ruta de selección de asientos (recibe ID del bus)
  { path: 'seleccion-asiento/:id', component: SeleccionAsientoComponent },
  
  // Ruta de registro de pasajeros
  { path: 'registro-pasajero', component: RegistroPasajeroComponent },

  // 2. NUEVA RUTA: Pantalla de Pago
  { path: 'pago', component: PagoComponent },

  { path: 'confirmacion', component: ConfirmacionComponent },

  {path: 'autogestion', component: AutogestionComponent},

  { path: 'admin-login', component: AdminLoginComponent },
  {path: 'panel-administrador', component: PanelAdministradorComponent},

  // Redirección por defecto
  { path: '**', redirectTo: '' }
];