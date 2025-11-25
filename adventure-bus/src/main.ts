import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';

// Importamos la clase 'App' (tu componente) desde el archivo estándar 'app.component.ts'
// y le damos un alias 'AppComponent' para usarlo en bootstrapApplication.
import { App as AppComponent } from './app/app'; 

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));