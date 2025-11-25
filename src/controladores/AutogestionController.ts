import { Request, Response, Router } from "express";
import { ReservaService } from "../servicios/ReservaService";

// Creamos un nuevo router específico para la autogestión
const AutogestionRouter = Router();

/**
 * POST /api/autogestion/buscar
 * Busca una reserva por código y correo electrónico, y devuelve los detalles.
 * * Body esperado: { "codigoReserva": "CRS-123456", "correoElectronico": "pasajero@mail.com" }
 */
AutogestionRouter.post('/buscar', async (req: Request, res: Response) => {
    const { codigoReserva, correoElectronico } = req.body;

    if (!codigoReserva || !correoElectronico) {
        return res.status(400).json({ message: "Código de reserva y correo electrónico son requeridos." });
    }

    try {
        // Llama a la función de servicio que verifica la existencia, estado y pertenencia.
        const reserva = await ReservaService.findReservaForAutogestion(
            codigoReserva,
            correoElectronico
        );

        if (!reserva) {
            // Se usa 404 para datos incorrectos o no encontrados, por seguridad.
            return res.status(404).json({ message: "Reserva no encontrada o datos de verificación incorrectos." });
        }

        // Retornamos la reserva completa (incluyendo detalles de Bus y Pasajero gracias a las relaciones)
        return res.status(200).json(reserva);

    } catch (error) {
        console.error("Error en la búsqueda de autogestión:", error);
        return res.status(500).json({ message: "Error interno al buscar la reserva." });
    }
});

/**
 * DELETE /api/autogestion/cancelar/:id
 * Cancela una reserva existente usando su ID interno. 
 * Este ID se obtiene primero con el endpoint /buscar.
 */
AutogestionRouter.delete('/cancelar/:id', async (req: Request, res: Response) => {
    try {
        // Aseguramos que el ID sea un número entero
        const reservaId = parseInt(req.params.id, 10);
        
        if (isNaN(reservaId)) {
            return res.status(400).json({ message: "ID de reserva inválido." });
        }

        // Llama al servicio para ejecutar la lógica de cancelación (marcar CANCELADA, liberar asiento)
        const cancelledReserva = await ReservaService.cancelReserva(reservaId);
        
        return res.status(200).json({ 
            message: `Reserva ${cancelledReserva.codigoReserva} cancelada exitosamente.`,
            reserva: cancelledReserva
        });

    } catch (error: any) {
        // --- CAMBIO IMPORTANTE: Manejo de Errores con Códigos HTTP correctos ---
        if (error.message.includes("not found")) {
            // Si el servicio no encuentra la reserva
            return res.status(404).json({ message: "La reserva a cancelar no fue encontrada." });
        }
        if (error.message.includes("already cancelled")) {
            // Si la reserva ya estaba cancelada (mal estado)
            return res.status(400).json({ message: "Esta reserva ya había sido cancelada previamente." });
        }
        
        console.error("Error al cancelar la reserva:", error);
        return res.status(500).json({ message: "Error interno al cancelar la reserva." });
        // ------------------------------------------------------------------------
    }
});


export { AutogestionRouter };