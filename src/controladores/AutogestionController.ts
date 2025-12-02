import { Request, Response, Router } from "express";
import { ReservaService } from "../servicios/ReservaService";

const AutogestionRouter = Router();

/**
 * GET /api/autogestion/buscar
 * Busca una reserva por Código y Correo (usando Query Parameters).
 * Frontend llama a: /api/autogestion/buscar?codigo=X&email=Y
 */
AutogestionRouter.get('/buscar', async (req: Request, res: Response) => {
    try {
        // Usamos req.query para obtener los parámetros de la URL
        const { codigo, email } = req.query; 

        if (!codigo || !email) {
            return res.status(400).json({ message: "Código de reserva y correo electrónico son requeridos." });
        }

        // Llama al servicio para buscar la reserva
        const reserva = await ReservaService.findReservaForAutogestion(codigo.toString(), email.toString());

        if (!reserva) {
            // 404 para indicar que el recurso no fue encontrado o la combinación es incorrecta
            return res.status(404).json({ message: "Reserva no encontrada o datos de verificación incorrectos." });
        }

        // Retornamos la reserva completa (con Bus y Pasajero)
        return res.status(200).json(reserva);

    } catch (error) {
        console.error("Error en la búsqueda de autogestión:", error);
        return res.status(500).json({ message: "Error interno al buscar la reserva." });
    }
});

/**
 * POST /api/autogestion/cancelar
 * Cancela una reserva existente (recibe el ID en el body).
 * Frontend llama a: POST /api/autogestion/cancelar con { reservaId: 123 }
 */
AutogestionRouter.post('/cancelar', async (req: Request, res: Response) => {
    try {
        // Obtenemos reservaId del body (POST)
        const { reservaId } = req.body; 
        
        // Convertimos el ID a número (ya que viene del body como string)
        const id = parseInt(reservaId, 10);
        
        if (isNaN(id)) {
             return res.status(400).json({ message: "ID de reserva inválido." });
        }

        // Llama al servicio para ejecutar la lógica de cancelación (marcar CANCELADA, liberar asiento)
        const reservaCancelada = await ReservaService.cancelReserva(id);
        
        return res.status(200).json({ 
            message: `Reserva ${reservaCancelada.codigoReserva} cancelada exitosamente.`,
            reserva: reservaCancelada 
        });

    } catch (error: any) {
        // Manejo de errores que vienen del servicio (ej: 'Reserva not found' o 'already cancelled')
        if (error.message.includes("not found")) {
            return res.status(404).json({ message: "La reserva a cancelar no fue encontrada." });
        }
        if (error.message.includes("already cancelled")) {
            return res.status(400).json({ message: "Esta reserva ya había sido cancelada previamente." });
        }
        
        console.error("Error al cancelar la reserva:", error);
        return res.status(500).json({ message: "Error interno al cancelar la reserva." });
    }
});


export { AutogestionRouter };