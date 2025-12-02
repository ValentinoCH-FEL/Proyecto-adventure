import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:3000/api'; 

// Interfaz que representa los datos de la reserva que devuelve el backend
export interface ReservaDetalle {
    id: number;
    codigoReserva: string;
    fechaViaje: string;
    estadoReserva: string;
    precioPagado: number;
    asientoNumero: string;
    
    // Relaciones cargadas por TypeORM
    bus: { rutaOrigen: string, rutaDestino: string, horaSalida: string };
    pasajero: { nombres: string, apellidoPaterno: string, correoElectronico: string };
}

@Injectable({ providedIn: 'root' })
export class AutogestionService {
  private http = inject(HttpClient);

  /**
   * Llama al backend para buscar una reserva por código y correo.
   */
  buscarReserva(codigo: string, email: string): Observable<ReservaDetalle> {
    let params = new HttpParams()
      .set('codigo', codigo)
      .set('email', email);
      
    // Llama a GET /api/autogestion/buscar?codigo=X&email=Y
    return this.http.get<ReservaDetalle>(`${API_URL}/autogestion/buscar`, { params });
  }

  /**
   * Llama al backend para cambiar el estado de la reserva a CANCELADA.
   */
  cancelarReserva(reservaId: number): Observable<any> {
    // Llama a POST /api/autogestion/cancelar
    return this.http.post(`${API_URL}/autogestion/cancelar`, { reservaId });
  }
}