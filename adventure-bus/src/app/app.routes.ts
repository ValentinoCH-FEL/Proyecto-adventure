import { Routes } from '@angular/router';

// -------------------------------------------------------------------
// IMPORTACIONES DE COMPONENTES
// -------------------------------------------------------------------

import { AdminLoginComponent } from './views/admin-login/admin-login'; 
import { PanelAdministradorComponent } from './views/panel-administrador/panel-administrador.component';
// Importa otros componentes aquí a medida que los necesitemos
// import { IndexComponent } from './views/index/index.component'; // Descomentar cuando lo creemos

export const routes: Routes = [
  // 1. Ruta de Login de Administración
  // URL: /admin-login
  { path: 'admin-login', component: AdminLoginComponent },

  // 2. Ruta del Panel de Administración (Requiere autenticación en la práctica)
  // URL: /panel-administrador
  { path: 'panel-administrador', component: PanelAdministradorComponent },
   
  // 3. Ruta de la página principal (index)
  // { path: 'index', component: IndexComponent },

  // 4. Ruta de Redirección: Si la URL está vacía, redirige al login de admin temporalmente
  // { path: '', redirectTo: '/index', pathMatch: 'full' }, // Usar esto cuando 'index' esté listo
  { path: '', redirectTo: '/admin-login', pathMatch: 'full' }, 

  // 5. Ruta comodín para páginas no encontradas (404 - opcional)
  // { path: '**', component: NotFoundComponent },
];