import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// AJUSTE: Apuntamos directamente a la ruta base de buses
const API_URL = 'http://localhost:3000/api/buses'; 

export interface AsientoOcupadoDTO {
  asientoNumero: string | number; 
  numeroAsiento?: string | number; 
  fechaViaje: string;
}

export interface BusDTO {
  id: number;
  placa: string;
  modelo: string;        
  capacidadTotal: number;
  rutaOrigen: string;
  rutaDestino: string;
  horaSalida: string;
  tarifaBase: number;
  tipoServicio: string;
  estadoActivo: boolean;
  asientosOcupados?: AsientoOcupadoDTO[]; 
}

@Injectable({ providedIn: 'root' })
export class BusService {
  private http = inject(HttpClient);

  // ===============================================
  // FUNCIONES CRUD (ADMINISTRACIÓN)
  // ===============================================

  findAllBuses(): Observable<BusDTO[]> {
    return this.http.get<BusDTO[]>(API_URL);
  }

  guardarBus(bus: BusDTO): Observable<any> {
    if (bus.id === 0) {
        return this.http.post(API_URL, bus); 
    } else {
        return this.http.put(`${API_URL}/${bus.id}`, bus); 
    }
  }

  updateBus(id: number, bus: BusDTO): Observable<any> {
    return this.http.put(`${API_URL}/${id}`, bus); 
  }

  eliminarBus(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/${id}`);
  }

  // ===============================================
  // OTRAS FUNCIONES (MERCADO PÚBLICO / BUSCADOR)
  // ===============================================

  /**
   * Obtener un bus por ID (Para el mapa de asientos del cliente)
   * Incluye normalización de datos para asegurar compatibilidad.
   */
  obtenerBusPorId(id: number, fecha?: string): Observable<BusDTO> {
    const params: any = {};
    if (fecha) params.fecha = fecha;

    return this.http.get<BusDTO>(`${API_URL}/${id}`, { params }).pipe(
      map(bus => {
        // NORMALIZACIÓN DE DATOS:
        // Si el backend devuelve 'asientoNumero' (DB), lo copiamos a 'numeroAsiento'
        // para asegurar que cualquier componente lo encuentre.
        if (bus.asientosOcupados) {
          bus.asientosOcupados = bus.asientosOcupados.map(ocup => ({
            ...ocup,
            numeroAsiento: ocup.numeroAsiento || (ocup as any).asientoNumero
          }));
        }
        return bus;
      })
    );
  }

  buscarViajes(origen: string, destino: string, fecha: string): Observable<BusDTO[]> {
    return this.http.get<BusDTO[]>(`${API_URL}/buscar/ruta`, {
      params: { origen, destino, fecha }
    });
  }
}