import { HttpInterceptorFn, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';

// Interceptor funcional (mecanismo moderno de Angular)
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  
  // Inyectamos el servicio de autenticación para obtener el token
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Clonamos la solicitud original para añadir el encabezado de autorización
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}` // Formato estándar JWT: Bearer [token]
      }
    });
  }

  // Devolvemos la solicitud modificada (o la original si no hay token)
  return next(req);
};