// src/repositorios/ReservaRepository.ts

import { Repository } from "typeorm";
import { AppDataSource } from "../database/data-source";
import { Reserva } from "../modulos/Reserva.entity";
import { Pasajero } from "../modulos/Pasajero.entity";
import { Bus } from "../modulos/Bus.entity";

// Exportamos la instancia base del repositorio
const ReservaRepo: Repository<Reserva> = AppDataSource.getRepository(Reserva);

export class ReservaRepository {
    static findById(reservaId: number) {
        throw new Error("Method not implemented.");
    }

    /**
     * CLAVE PARA AUTOGESTIÓN: Busca reservas por Código de Reserva y Correo Electrónico.
     * Esto verifica que el usuario es el dueño del ticket.
     */
    static async findByCodigoReservaAndPasajeroEmail(
        codigoReserva: string, 
        correoElectronico: string
    ): Promise<Reserva | null> {
        return ReservaRepo.createQueryBuilder("reserva")
            .innerJoinAndSelect("reserva.pasajero", "pasajero") // JOIN con la tabla pasajero
            .where("reserva.codigoReserva = :codigo", { codigo: codigoReserva })
            .andWhere("pasajero.correoElectronico = :correo", { correo: correoElectronico })
            .getOne(); // Usamos getOne() ya que el código de reserva debe ser único
    }

    /**
     * Obtiene todas las reservas (confirmadas) para un bus y fecha específicos.
     * Útil para calcular la disponibilidad de asientos.
     */
    static async findConfirmedByBusAndDate(busId: number, fechaViaje: Date): Promise<Reserva[]> {
        return ReservaRepo.find({
            where: {
                bus: { id: busId },
                fechaViaje: fechaViaje,
                estadoReserva: "CONFIRMADA"
            },
            relations: ["pasajero"]
        });
    }

    /**
     * Método genérico para guardar o actualizar una reserva.
     */
    static async save(reserva: Reserva): Promise<Reserva> {
        return ReservaRepo.save(reserva);
    }
}