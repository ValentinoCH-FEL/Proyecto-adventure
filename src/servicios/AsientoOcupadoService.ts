// src/servicios/AsientoOcupadoService.ts (Versión Final)

import { AppDataSource } from "../database/data-source";
import { AsientoOcupado } from "../modulos/AsientoOcupado.entity";
import { Repository } from "typeorm";
import { Bus } from "../modulos/Bus.entity"; // <-- NECESARIO
import { Reserva } from "../modulos/Reserva.entity"; // <-- NECESARIO

export class AsientoOcupadoService {
    
    private static AsientoOcupadoRepository: Repository<AsientoOcupado> = 
        AppDataSource.getRepository(AsientoOcupado);

    /**
     * Obtiene una lista de números de asiento ocupados.
     */
    static async getOccupiedSeats(busId: number, fechaViaje: Date): Promise<string[]> {
        
        const startOfDay = new Date(fechaViaje);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(fechaViaje);
        endOfDay.setHours(23, 59, 59, 999);

        // Utilizamos 'asiento.bus.id' para acceder al ID a través de la relación TypeORM
        const occupiedRecords = await this.AsientoOcupadoRepository.createQueryBuilder("asiento")
            .where("asiento.bus.id = :busId", { busId }) 
            .andWhere("asiento.fechaViaje BETWEEN :startOfDay AND :endOfDay", { startOfDay, endOfDay })
            .select("asiento.numeroAsiento", "numeroAsiento") 
            .getRawMany();

        return occupiedRecords.map(record => record.numeroAsiento);
    }

    /**
     * Marca un asiento como ocupado (Creación).
     * Recibe el objeto Bus y Reserva completos para la relación ManyToOne.
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
     * Elimina el registro de asiento ocupado (Cancelación).
     */
    static async unmarkSeat(reservaId: number): Promise<void> {
        // Elimina el asiento ocupado basado en el ID de la reserva.
        await this.AsientoOcupadoRepository.delete({ reserva: { id: reservaId as any } });
    }
}