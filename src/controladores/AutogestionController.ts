// src/controladores/AutogestionController.ts

import { Request, Response, Router } from "express";
import { ReservaService } from "../servicios/ReservaService";

const AutogestionRouter = Router();

/**
 * POST /api/autogestion/buscar
 * Busca una reserva por código y correo electrónico (image_4b23db.png).
 */
AutogestionRouter.post('/buscar', async (req: Request, res: Response) => {
    const { codigoReserva, correoElectronico } = req.body;

    if (!codigoReserva || !correoElectronico) {
        return res.status(400).json({ message: "Código de reserva y correo electrónico son requeridos." });
    }

    try {
        const reserva = await ReservaService.findReservaForAutogestion(
            codigoReserva,
            correoElectronico
        );

        if (!reserva) {
            return res.status(404).json({ message: "Reserva no encontrada o datos incorrectos." });
        }

        // Se retorna la reserva (con detalles del bus y pasajero)
        return res.status(200).json(reserva);

    } catch (error) {
        console.error("Error in autogestion search:", error);
        return res.status(500).json({ message: "Error interno al buscar la reserva." });
    }
});

/**
 * POST /api/autogestion/cancelar/:id
 * Cancela una reserva existente.
 */
AutogestionRouter.post('/cancelar/:id', async (req: Request, res: Response) => {
    try {
        const reservaId = parseInt(req.params.id);
        
        if (isNaN(reservaId)) {
            return res.status(400).json({ message: "ID de reserva inválido." });
        }

        const cancelledReserva = await ReservaService.cancelReserva(reservaId);
        
        return res.status(200).json({ 
            message: `Reserva ${cancelledReserva.codigoReserva} cancelada exitosamente.`,
            reserva: cancelledReserva
        });

    } catch (error: any) {
        if (error.message.includes("not found")) {
            return res.status(404).json({ message: error.message });
        }
        console.error("Error cancelling reservation:", error);
        return res.status(500).json({ message: "Error interno al cancelar la reserva." });
    }
});


export { AutogestionRouter };