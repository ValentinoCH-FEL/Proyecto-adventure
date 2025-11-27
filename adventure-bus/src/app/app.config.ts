import { ApplicationConfig } from '@angular/core';
import { routes } from './app.routes'; 
import { provideRouter, provideRoutes } from '@angular/router';
// **Nota:** Este archivo se mantiene solo para satisfacer la estructura de la CLI, 
// pero se deja casi vacío ya que las rutas se manejan en 'main.ts'.

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    
  ]
};