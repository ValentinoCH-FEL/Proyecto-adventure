import { AppDataSource } from "../database/data-source";
import { Pasajero } from "../modulos/Pasajero.entity";
import { Reserva } from "../modulos/Reserva.entity";
import { Bus } from "../modulos/Bus.entity";
import { AsientoOcupado } from "../modulos/AsientoOcupado.entity";
import { EntityManager } from "typeorm";

// NO ES NECESARIO IMPORTAR OTROS SERVICIOS DENTRO DE ESTE
// import { BusService } from "./BusService";
// import { AsientoOcupadoService } from "./AsientoOcupadoService"; 

// Definición de Interfaz de Datos para la compra
interface NewReservaData {
    busId: number;
    fechaViaje: Date;
    asientoNumero: string;
    precioPagado: number;
    pasajeroData: any; // Recibe un objeto simple del controlador
}

export class ReservaService {

    // 1. Repositorios definidos como propiedades estáticas para acceso global
    private static pasajeroRepo = AppDataSource.getRepository(Pasajero);
    private static reservaRepo = AppDataSource.getRepository(Reserva);
    private static busRepo = AppDataSource.getRepository(Bus);
    private static asientoRepo = AppDataSource.getRepository(AsientoOcupado);


    /**
     * [LÓGICA CENTRAL] Crea una nueva reserva, verifica la disponibilidad y marca el asiento.
     * Utiliza una transacción atómica para asegurar que todas las operaciones se completen.
     */
    static async createNewReserva(data: NewReservaData): Promise<Reserva> {
        
        // Usamos una transacción para que si falla el asiento/pasajero, nada se guarde.
        return AppDataSource.manager.transaction(async (transactionalEntityManager: EntityManager) => {
            
            // =====================================================
            // PASO 1: GESTIONAR AL PASAJERO (BUSCAR O CREAR)
            // =====================================================
            let pasajero = await transactionalEntityManager.findOne(Pasajero, {
                where: { numeroDocumento: data.pasajeroData.numeroDocumento }
            });

            if (pasajero) {
                // Si existe: Actualizar datos (no usamos merge completo para evitar overwrites indeseados)
                pasajero.correoElectronico = data.pasajeroData.correoElectronico;
                pasajero.nacionalidad = data.pasajeroData.nacionalidad;
                // Puedes actualizar más campos si lo consideras necesario
                pasajero = await transactionalEntityManager.save(pasajero);
            } else {
                // Si no existe: Crear uno nuevo
                pasajero = transactionalEntityManager.create(Pasajero, data.pasajeroData);
                pasajero = await transactionalEntityManager.save(pasajero);
            }
            
            // =====================================================
            // PASO 2: VERIFICAR Y OBTENER BUS
            // =====================================================
            // Usamos findOneBy para obtener el objeto Bus (sin usar otro BusService)
            const bus = await transactionalEntityManager.findOneBy(Bus, { id: data.busId });
            if (!bus) throw new Error("Bus not found.");
            
            // =====================================================
            // PASO 3: VERIFICAR DISPONIBILIDAD (Doble Venta Check)
            // =====================================================
            const asientoOcupadoExistente = await transactionalEntityManager.findOne(AsientoOcupado, {
                where: {
                    bus: { id: data.busId },
                    fechaViaje: data.fechaViaje,
                    numeroAsiento: data.asientoNumero
                }
            });

            if (asientoOcupadoExistente) {
                throw new Error(`Seat ${data.asientoNumero} is already occupied.`);
            }

            // =====================================================
            // PASO 4: CREAR LA RESERVA
            // =====================================================
            const codigoReserva = ReservaService.generarCodigoReserva();

            const newReserva = transactionalEntityManager.create(Reserva, {
                codigoReserva,
                bus,
                pasajero, // Vinculado al pasajero del paso 1
                asientoNumero: data.asientoNumero,
                precioPagado: data.precioPagado,
                fechaViaje: data.fechaViaje,
                estadoReserva: "CONFIRMADA",
                fechaCompra: new Date()
            });
            
            const savedReserva = await transactionalEntityManager.save(newReserva);

            // =====================================================
            // PASO 5: MARCAR ASIENTO OCUPADO (Bloqueo)
            // =====================================================
            const newAsientoOcupado = transactionalEntityManager.create(AsientoOcupado, {
                bus,
                numeroAsiento: data.asientoNumero,
                fechaViaje: data.fechaViaje,
                reserva: savedReserva // Vinculado a la nueva reserva
            });
            
            await transactionalEntityManager.save(newAsientoOcupado);

            return savedReserva;
        });
    }

    /**
     * Función auxiliar para generar un código de reserva único.
     */
    private static generarCodigoReserva(): string {
        const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let codigo = 'ADV-';
        for (let i = 0; i < 6; i++) {
            codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
        }
        return codigo;
    }

    // --- MÉTODOS DE AUTOGESTIÓN (Se mantienen como estaban) ---
    
    /**
     * [AUTOGESTIÓN] Busca una reserva por su código y correo.
     */
    static async findReservaForAutogestion(codigoReserva: string, correoElectronico: string): Promise<Reserva | null> {
        const reservaRepository = AppDataSource.getRepository(Reserva);

        const reserva = await reservaRepository.findOne({
            where: {
                codigoReserva: codigoReserva,
                estadoReserva: "CONFIRMADA"
            },
            relations: ["bus", "pasajero"]
        });

        if (!reserva) return null;
        if (reserva.pasajero.correoElectronico !== correoElectronico) return null;

        return reserva;
    }

    /**
     * [AUTOGESTIÓN] Cancela una reserva, liberando el asiento.
     */
    // Necesitas el AsientoOcupadoService.unmarkSeat() para que esto funcione
    static async cancelReserva(reservaId: number): Promise<Reserva> {
        const reservaRepository = AppDataSource.getRepository(Reserva);
        
        const reserva = await reservaRepository.findOne({ where: { id: reservaId } });
        
        if (!reserva) throw new Error("Reserva not found.");
        if (reserva.estadoReserva === "CANCELADA") throw new Error("Reserva already cancelled.");

        reserva.estadoReserva = "CANCELADA";
        const cancelledReserva = await reservaRepository.save(reserva);

        // OJO: Aquí necesitas una llamada a un servicio que elimine la fila de asientos_ocupados
        // await AsientoOcupadoService.unmarkSeat(reservaId); 

        return cancelledReserva;
    }
}