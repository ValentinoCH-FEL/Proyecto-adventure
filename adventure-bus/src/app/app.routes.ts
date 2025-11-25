import { Routes } from '@angular/router';

// Importaciones de los componentes que están en la carpeta 'views'
import { AdminLoginComponent } from './views/admin-login/admin-login.component';
//import { PanelAdministradorComponent } from './views/panel-administrador/panel-administrador.component';
// Importa otros componentes aquí a medida que los necesitemos (ej: IndexComponent)

export const routes: Routes = [
  // 1. Ruta de Login de Administración
  // URL: /admin-login
  { path: 'admin-login', component: AdminLoginComponent },

  // 2. Ruta del Panel de Administración
  // URL: /panel-administrador
  //{ path: 'panel-administrador', component: PanelAdministradorComponent },
  
  // 3. Ruta de la página principal (index)
  // Utilizaremos 'index' como ruta principal por ahora.
  // **NOTA:** Tendremos que crear el componente 'index.component.ts' a continuación.
  // { path: 'index', component: IndexComponent },

  // 4. Ruta de Redirección: Si la URL está vacía, redirige al login de admin temporalmente
  // { path: '', redirectTo: '/index', pathMatch: 'full' }, // Usar esto cuando 'index' esté listo
  { path: '', redirectTo: '/admin-login', pathMatch: 'full' }, 

  // 5. Ruta comodín para páginas no encontradas (404 - opcional)
  // { path: '**', component: NotFoundComponent },
];