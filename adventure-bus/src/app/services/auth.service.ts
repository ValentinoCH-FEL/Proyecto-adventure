import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

const API_URL = 'http://localhost:3000/api';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private tokenKey = 'auth_token';

  // Observable que rastrea si el usuario está logueado
  private _isLoggedIn = new BehaviorSubject<boolean>(this.hasToken());

  isLoggedIn$ = this._isLoggedIn.asObservable();

  constructor() {
    // Inicializa el estado de logueo al cargar la app
    this._isLoggedIn.next(this.hasToken());
  }

  /**
   * Verifica si existe un token válido.
   */
  hasToken(): boolean {
    // Aquí podrías añadir lógica de validación de JWT (expiración)
    return !!localStorage.getItem(this.tokenKey);
  }

  /**
   * Llama al backend para iniciar sesión.
   */
  login(credentials: any): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${API_URL}/admin/login`, credentials).pipe(
      tap(response => {
        // Si el login es exitoso, guarda el token
        localStorage.setItem(this.tokenKey, response.token);
        this._isLoggedIn.next(true);
      }),
      catchError(err => {
        this._isLoggedIn.next(false);
        // Devuelve el error para que el componente lo maneje
        return of(err); 
      })
    );
  }

  /**
   * Cierra la sesión y elimina el token.
   */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this._isLoggedIn.next(false);
    // Redirige al inicio o login
  }

  /**
   * Obtiene el token para ser usado en interceptores o rutas protegidas.
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
}