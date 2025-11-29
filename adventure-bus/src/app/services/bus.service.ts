import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

// IMPORTANTE: Asegúrate de que esta URL sea la de tu backend
const API_URL = 'http://localhost:3000/api'; 

// Definimos cómo se ven los datos que vienen del backend
export interface AsientoOcupadoDTO {
  numeroAsiento: string;
  fechaViaje: string;
}

export interface BusDTO {
  id: number;
  placa: string;
  modelo: string;       // <--- ¡ESTO FALTABA! Por eso te salía el error rojo
  capacidadTotal: number;
  rutaOrigen: string;
  rutaDestino: string;
  horaSalida: string;
  tarifaBase: number;
  tipoServicio: string;
  asientosOcupados: AsientoOcupadoDTO[];
}
@Injectable({ providedIn: 'root' })
export class BusService {
  private http = inject(HttpClient);
  // Asegúrate de que esta URL coincida con tu backend
  private apiUrl = 'http://localhost:3000/api'; 

  obtenerBusPorId(id: number): Observable<BusDTO> {
    return this.http.get<BusDTO>(`${this.apiUrl}/buses/${id}`);
  }

  // --- NUEVO MÉTODO DE BÚSQUEDA ---
  buscarViajes(origen: string, destino: string, fecha: string): Observable<BusDTO[]> {
    // Enviamos los parámetros como query params (?origen=...&destino=...)
    return this.http.get<BusDTO[]>(`${this.apiUrl}/buses/buscar/ruta`, {
      params: { origen, destino, fecha }
    });
  }
}
