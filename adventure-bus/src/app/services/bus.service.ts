import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

// AJUSTE: Apuntamos directamente a la ruta base de buses
const API_URL = 'http://localhost:3000/api/buses'; 

export interface AsientoOcupadoDTO {
  numeroAsiento: string;
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
  // Lo ponemos opcional (?) para que no de error al crear un bus nuevo que aún no tiene historial
  asientosOcupados?: AsientoOcupadoDTO[]; 
}

@Injectable({ providedIn: 'root' })
export class BusService {
  private http = inject(HttpClient);

  // ===============================================
  // FUNCIONES CRUD (ADMINISTRACIÓN)
  // ===============================================

  /**
   * [READ] Obtiene TODOS los buses.
   * GET http://localhost:3000/api/buses
   */
  findAllBuses(): Observable<BusDTO[]> {
    return this.http.get<BusDTO[]>(API_URL);
  }

  /**
   * [CREATE / UPDATE] Lógica unificada para guardar.
   * Si id es 0 -> POST (Crear)
   * Si id > 0 -> PUT (Actualizar)
   */
  guardarBus(bus: BusDTO): Observable<any> {
    if (bus.id === 0) {
        // CREAR: POST http://localhost:3000/api/buses
        return this.http.post(API_URL, bus); 
    } else {
        // ACTUALIZAR: PUT http://localhost:3000/api/buses/:id
        return this.http.put(`${API_URL}/${bus.id}`, bus); 
    }
  }

  /**
   * [UPDATE] Actualiza un bus por ID explícitamente.
   * PUT http://localhost:3000/api/buses/:id
   */
  updateBus(id: number, bus: BusDTO): Observable<any> {
    return this.http.put(`${API_URL}/${id}`, bus); 
  }

  /**
   * [DELETE] Elimina un bus por ID.
   * DELETE http://localhost:3000/api/buses/:id
   */
  eliminarBus(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/${id}`);
  }

  // ===============================================
  // OTRAS FUNCIONES (MERCADO PÚBLICO / BUSCADOR)
  // ===============================================

  /**
   * Obtener un bus por ID (Para el mapa de asientos del cliente)
   * GET http://localhost:3000/api/buses/:id
   */
  obtenerBusPorId(id: number): Observable<BusDTO> {
    return this.http.get<BusDTO>(`${API_URL}/${id}`);
  }

  /**
   * Buscar viajes específicos
   * GET http://localhost:3000/api/buses/buscar/ruta
   */
  buscarViajes(origen: string, destino: string, fecha: string): Observable<BusDTO[]> {
    return this.http.get<BusDTO[]>(`${API_URL}/buscar/ruta`, {
      params: { origen, destino, fecha }
    });
  }
}