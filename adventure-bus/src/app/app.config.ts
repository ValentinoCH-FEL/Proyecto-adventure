import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
// 1. Importamos la función para proveer interceptores
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http'; 
// 2. Importamos nuestro interceptor de seguridad
import { authInterceptor } from './core/interceptors/auth.interceptor'; 

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // 3. REGISTRAMOS EL INTERCEPTOR JWT
    provideHttpClient(withInterceptors([authInterceptor]), withFetch()) 
  ]
};