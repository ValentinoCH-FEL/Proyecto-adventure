// src/servicios/AsientoOcupadoService.ts (Versión Final)

import { AppDataSource } from "../database/data-source";
import { AsientoOcupado } from "../modulos/AsientoOcupado.entity";
import { Repository } from "typeorm";
import { Bus } from "../modulos/Bus.entity"; // NECESARIO
import { Reserva } from "../modulos/Reserva.entity"; // NECESARIO

export class AsientoOcupadoService {
    
    // Inicializamos el repositorio para usarlo en todos los métodos estáticos
    private static AsientoOcupadoRepository: Repository<AsientoOcupado> = 
        AppDataSource.getRepository(AsientoOcupado);

    /**
     * Obtiene una lista de números de asiento ocupados.
     * Filtra por ID de bus y fecha de viaje.
     */
    static async getOccupiedSeats(busId: number, fechaViaje: Date): Promise<string[]> {
        
        // Configura los límites de hora para buscar en todo el día
        const startOfDay = new Date(fechaViaje);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(fechaViaje);
        endOfDay.setHours(23, 59, 59, 999);

        // Consulta usando QueryBuilder para encontrar asientos ocupados
        const occupiedRecords = await this.AsientoOcupadoRepository.createQueryBuilder("asiento")
            .where("asiento.bus.id = :busId", { busId }) 
            .andWhere("asiento.fechaViaje BETWEEN :startOfDay AND :endOfDay", { startOfDay, endOfDay })
            .select("asiento.numeroAsiento", "numeroAsiento") 
            .getRawMany();

        return occupiedRecords.map(record => record.numeroAsiento);
    }

    /**
     * Marca un asiento como ocupado (al crear una reserva).
     * Recibe el objeto Bus y Reserva completos para establecer las relaciones.
     */
    static async createOccupiedSeat(bus: Bus, asientoNumero: string, fechaViaje: Date, reserva: Reserva): Promise<AsientoOcupado> {
        const occupied = new AsientoOcupado();
        occupied.bus = bus; 
        occupied.numeroAsiento = asientoNumero;
        occupied.fechaViaje = fechaViaje;
        occupied.reserva = reserva; 

        return this.AsientoOcupadoRepository.save(occupied);
    }
    
    /**
     * [AUTOGESTIÓN] Elimina el registro de asiento ocupado.
     * Se usa cuando una reserva es cancelada para liberar el asiento.
     */
    static async unmarkSeat(reservaId: number): Promise<void> {
        // Elimina el asiento ocupado basado en el ID de la reserva.
        await this.AsientoOcupadoRepository.delete({ reserva: { id: reservaId as any } });
        console.log(`Asiento ocupado liberado para Reserva ID: ${reservaId}`);
    }
}