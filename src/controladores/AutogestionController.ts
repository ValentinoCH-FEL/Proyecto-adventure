import { Request, Response, Router } from "express";
import { ReservaService } from "../servicios/ReservaService";
import { AppDataSource } from "../database/data-source"; // Importamos la conexión a BD
import { AsientoOcupado } from "../modulos/AsientoOcupado.entity"; // Importamos la entidad del bloqueo

const AutogestionRouter = Router();

/**
 * GET /api/autogestion/buscar
 * Busca una reserva por Código y Correo.
 */
AutogestionRouter.get('/buscar', async (req: Request, res: Response) => {
    try {
        const { codigo, email } = req.query; 

        if (!codigo || !email) {
            return res.status(400).json({ message: "Código de reserva y correo electrónico son requeridos." });
        }

        const reserva = await ReservaService.findReservaForAutogestion(codigo.toString(), email.toString());

        if (!reserva) {
            return res.status(404).json({ message: "Reserva no encontrada o datos de verificación incorrectos." });
        }

        return res.status(200).json(reserva);

    } catch (error) {
        console.error("Error en la búsqueda de autogestión:", error);
        return res.status(500).json({ message: "Error interno al buscar la reserva." });
    }
});

/**
 * POST /api/autogestion/cancelar
 * Cancela una reserva y LIBERA EL ASIENTO.
 */
AutogestionRouter.post('/cancelar', async (req: Request, res: Response) => {
    try {
        const { reservaId } = req.body; 
        
        const id = parseInt(reservaId, 10);
        
        if (isNaN(id)) {
             return res.status(400).json({ message: "ID de reserva inválido." });
        }

        // 1. Llamamos al servicio para cambiar el estado a "CANCELADA" (Historial Administrativo)
        const reservaCancelada = await ReservaService.cancelReserva(id);
        
        // 2. LIBERACIÓN DEL ASIENTO (Acción Física)
        // Eliminamos el registro de la tabla 'asientos_ocupados' vinculado a esta reserva.
        // Esto hace que el asiento vuelva a aparecer como "libre" en el mapa.
        const asientoRepo = AppDataSource.getRepository(AsientoOcupado);
        await asientoRepo.delete({ reserva: { id: id } });

        return res.status(200).json({ 
            message: `Reserva ${reservaCancelada.codigoReserva} cancelada y asiento liberado correctamente.`,
            reserva: reservaCancelada 
        });

    } catch (error: any) {
        if (error.message && error.message.includes("not found")) {
            return res.status(404).json({ message: "La reserva a cancelar no fue encontrada." });
        }
        if (error.message && error.message.includes("already cancelled")) {
            return res.status(400).json({ message: "Esta reserva ya había sido cancelada previamente." });
        }
        
        console.error("Error al cancelar la reserva:", error);
        return res.status(500).json({ message: "Error interno al cancelar la reserva." });
    }
});


export { AutogestionRouter };