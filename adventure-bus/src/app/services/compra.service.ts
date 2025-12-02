import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

// Asegúrate de que esta URL apunte a tu backend de Node.js
const API_URL = 'http://localhost:3000/api'; 

@Injectable({ providedIn: 'root' })
export class CompraService {
  private http = inject(HttpClient);

  /**
   * Envía la orden completa (con todos los pasajeros) al backend.
   * El backend se encargará de guardar al Pasajero, crear la Reserva y enviar el correo.
   */
  procesarCompra(datosOrden: any): Observable<any> {
    // La ruta que creaste es /api/compra
    return this.http.post(`${API_URL}/compra`, datosOrden);
  }
}