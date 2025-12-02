import { BusRepository } from "../repositorios/BusRepository";
import { Bus } from "../modulos/Bus.entity";

export class BusService {

    /**
     * [CRUD - Create] Guarda un bus nuevo. (Llamado por POST /api/admin/buses)
     */
    static async saveBus(busData: Bus): Promise<Bus> {
        // En un servicio real, aquí irían las validaciones de datos (placa, modelo, etc.)
        return BusRepository.save(busData);
    }
    
    /**
     * [CRUD - Update] Actualiza un bus por ID. (Llamado por PUT /api/admin/buses/:id)
     */
    static async updateBus(id: number, busData: Bus): Promise<Bus | null> {
        const busToUpdate = await BusRepository.findById(id); // Asume que encuentra por ID
        
        if (!busToUpdate) return null;

        // Sobrescribe las propiedades existentes con los nuevos datos
        // Usamos el operador spread para asegurar que el ID no se pierda.
        const updatedBus = { ...busToUpdate, ...busData, id }; 

        return BusRepository.save(updatedBus as Bus);
    }

    /**
     * [CRUD - Delete] Elimina un bus. (Llamado por DELETE /api/admin/buses/:id)
     */
    static async deleteBus(id: number): Promise<void> {
        await BusRepository.deleteById(id);
    }

    // ===========================================
    // FUNCIONES READ (LECTURA)
    // ===========================================

    /**
     * [READ - Admin] Obtiene TODOS los buses (activos e inactivos) para la vista de administración.
     */
    static async findAllBuses(): Promise<Bus[]> {
        // BusRepository.findAll() debe traer todos sin filtros.
        return BusRepository.findAll();
    }

    /**
     * [READ - Público] Obtiene solo los buses ACTIVOS (Para el home/buscador).
     */
    static async findActiveTrips(): Promise<Bus[]> {
        return BusRepository.findByEstadoActivoTrue();
    }

    /**
     * [READ - Público] Obtiene un bus por ID (para el mapa de asientos).
     */
    static async findBusById(id: number): Promise<Bus | null> {
        return BusRepository.findById(id);
    }
}