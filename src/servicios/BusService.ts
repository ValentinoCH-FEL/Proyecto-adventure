// src/servicios/BusService.ts

import { BusRepository } from "../repositorios/BusRepository";
import { Bus } from "../modulos/Bus.entity";

export class BusService {

    /**
     * [CRUD - Create/Update] Guarda o actualiza un bus.
     */
    static async saveBus(busData: Bus): Promise<Bus> {
        // En un servicio real, aquí irían las validaciones de datos (placa, modelo, etc.)
        return BusRepository.save(busData);
    }

    /**
     * [CRUD - Read] Obtiene todos los buses para la vista de administración.
     */
    static async findAllBuses(): Promise<Bus[]> {
        return BusRepository.findAll();
    }

    /**
     * [CRUD - Read] Obtiene un bus por ID.
     */
    static async findBusById(id: number): Promise<Bus | null> {
        return BusRepository.findById(id);
    }

    /**
     * [CRUD - Delete] Elimina un bus.
     */
    static async deleteBus(id: number): Promise<void> {
        await BusRepository.deleteById(id);
    }

    // --- Lógica de Negocio Específica ---

    /**
     * Busca los buses activos para el home (image_4a3aa6.png).
     */
    static async findActiveTrips(): Promise<Bus[]> {
        return BusRepository.findByEstadoActivoTrue();
    }
}