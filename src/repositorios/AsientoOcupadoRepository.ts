// src/repositorios/AsientoOcupadoRepository.ts

import { Repository, DeleteResult } from "typeorm";
import { AppDataSource } from "../database/data-source";
import { AsientoOcupado } from "../modulos/AsientoOcupado.entity";
import { Reserva } from "../modulos/Reserva.entity";

const AsientoRepo: Repository<AsientoOcupado> = AppDataSource.getRepository(AsientoOcupado);

export class AsientoOcupadoRepository {

    /**
     * Guarda un registro de asiento ocupado.
     */
    static async save(asiento: AsientoOcupado): Promise<AsientoOcupado> {
        return AsientoRepo.save(asiento);
    }

    /**
     * Obtiene todos los asientos ocupados para un bus y fecha específicos.
     */
    static async findByBusAndDate(busId: number, fechaViaje: Date): Promise<AsientoOcupado[]> {
        return AsientoRepo.find({
            where: {
                bus: { id: busId },
                fechaViaje: fechaViaje
            },
            select: ["numeroAsiento"] // Solo necesitamos el número de asiento
        });
    }

    /**
     * Libera un asiento al eliminar el registro asociado a una reserva.
     */
    static async deleteByReservaId(reservaId: number): Promise<DeleteResult> {
        // En TypeORM, si la relación está bien definida, podemos usar el objeto
        return AsientoRepo.delete({ reserva: { id: reservaId } });
    }
}