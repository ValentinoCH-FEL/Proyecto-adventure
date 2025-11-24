import { ReservaRepository } from "../repositorios/ReservaRepository";
import { BusService } from "./BusService";
import { AsientoOcupadoService } from "./AsientoOcupadoService";
import { Reserva } from "../modulos/Reserva.entity";
import { Pasajero } from "../modulos/Pasajero.entity";
import { AsientoOcupado } from "../modulos/AsientoOcupado.entity";
// Dejado, es necesario para las relaciones de TypeORM
import { Bus } from "../modulos/Bus.entity"; 
import { AppDataSource } from "../database/data-source";
import { EntityManager } from "typeorm";
import { PasajeroRepository } from "../repositorios/PasajeroRepository";

// Definición de Interfaz de Datos para la compra
interface NewReservaData {
    busId: number;
    fechaViaje: Date;
    asientoNumero: string;
    precioPagado: number;
    pasajeroData: any; // CORREGIDO: Recibe un objeto simple del controlador
}

export class ReservaService {
    // ... (findReservaForAutogestion se mantiene igual)

    /**
     * [LÓGICA CENTRAL] Crea una nueva reserva, verifica la disponibilidad y marca el asiento.
     * Usa una transacción atómica para guardar Pasajero, Reserva y AsientoOcupado.
     */
    static async createNewReserva(data: NewReservaData): Promise<Reserva> {
        
        return AppDataSource.manager.transaction(async (transactionalEntityManager: EntityManager) => {
            
            // --- 1. Obtener Entidades (Verificación de existencia) ---
            const bus = await BusService.findBusById(data.busId);
            if (!bus) throw new Error("Bus not found.");
            
            // --- 2. Verificar Disponibilidad de Asiento ---
            const occupiedSeats = await AsientoOcupadoService.getOccupiedSeats(data.busId, data.fechaViaje);
            if (occupiedSeats.includes(data.asientoNumero)) {
                throw new Error(`Seat ${data.asientoNumero} is already occupied.`);
            }

            // --- 3. Crear o Encontrar Pasajero ---
            let pasajero: Pasajero | null = null;
            
            // Buscar pasajero dentro de la transacción usando EntityManager
            pasajero = await transactionalEntityManager.findOne(Pasajero, {
                where: { numeroDocumento: data.pasajeroData.numeroDocumento }
            });
            
            if (!pasajero) {
                // Si no existe, crear uno nuevo
                const newPasajero = new Pasajero();
                Object.assign(newPasajero, data.pasajeroData); 
                
                // USAMOS EL ENTITYMANAGER TRANSACCIONAL PARA GUARDARLO
                pasajero = await transactionalEntityManager.save(newPasajero); 
            }
            
            if (!pasajero) throw new Error("Could not create or find passenger.");


            // --- 4. Crear Código de Reserva ---
            const codigoReserva = `CRS-${Math.floor(Math.random() * 900000 + 100000)}`;

            // --- 5. Crear la Entidad Reserva ---
            const newReserva = new Reserva();
            Object.assign(newReserva, {
                codigoReserva,
                bus,
                pasajero,
                asientoNumero: data.asientoNumero,
                precioPagado: data.precioPagado,
                fechaViaje: data.fechaViaje,
                estadoReserva: "CONFIRMADA"
            });
            
            // Usamos el EntityManager transaccional
            const savedReserva = await transactionalEntityManager.save(newReserva);

            // --- 6. Marcar Asiento Ocupado (Bloqueo) ---
            const newAsientoOcupado = new AsientoOcupado();
            newAsientoOcupado.bus = bus;
            newAsientoOcupado.numeroAsiento = data.asientoNumero;
            newAsientoOcupado.fechaViaje = data.fechaViaje;
            newAsientoOcupado.reserva = savedReserva; 

            // Usamos el EntityManager transaccional
            await transactionalEntityManager.save(newAsientoOcupado);

            return savedReserva;
        });
    }

    /**
     * [AUTOGESTIÓN] Cancela una reserva, liberando el asiento.
     */
    static async cancelReserva(reservaId: number): Promise<Reserva> {
        
        const reserva = (await ReservaRepository.findById(reservaId)) as unknown as Reserva | null;
        if (reserva === null || reserva === undefined) throw new Error("Reserva not found.");

        // ... (Lógica de Negocio de 24h omitida)

        // 1. Actualizar estado de la reserva
        reserva.estadoReserva = "CANCELADA";
        const cancelledReserva = await ReservaRepository.save(reserva);

        // 2. Liberar el asiento ocupado
        await AsientoOcupadoService.unmarkSeat(reservaId); 

        return cancelledReserva;
    }
}