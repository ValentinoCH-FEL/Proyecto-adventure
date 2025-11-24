import { Request, Response, Router } from "express";
import { ReservaService } from "../servicios/ReservaService";
import { CompraRequestDTO } from "../dtos/Compra.dto";
// La entidad Pasajero ya no es necesaria aquí

const CompraRouter = Router();

/**
 * POST /api/compra/finalizar
 * Procesa la compra completa, creando el Pasajero (si es nuevo) y la Reserva.
 */
CompraRouter.post('/finalizar', async (req: Request, res: Response) => {
    try {
        // --- 0. VALIDACIÓN: Si el body está vacío, respondemos con 400 ---
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: "La solicitud debe contener datos en formato JSON (body vacío)." });
        }
        
        const dto: CompraRequestDTO = req.body;

        // --- 1. Mapeo de datos del DTO a la estructura requerida ---
        
        // 1a. Objeto simple del Pasajero.
        const pasajeroDataSimple = {
            tipoDocumento: dto.tipoDocumento,
            numeroDocumento: dto.numeroDocumento,
            nombres: dto.nombres,
            apellidoPaterno: dto.apellidoPaterno,
            apellidoMaterno: dto.apellidoMaterno,
            correoElectronico: dto.correoElectronico,
            fechaNacimiento: new Date(dto.fechaNacimiento),
            nacionalidad: dto.nacionalidad,
            genero: dto.genero,
        };

        // 1b. Objeto de datos que se pasa al servicio (ReservaService)
        const reservaData = {
            busId: dto.busId,
            fechaViaje: new Date(dto.fechaViaje),
            asientoNumero: dto.asientoNumero,
            precioPagado: dto.precioPagado,
            // Pasamos el objeto simple del pasajero.
            pasajeroData: pasajeroDataSimple, 
        };
        
        // --- 2. Procesar la Reserva (Lógica Central en el Servicio) ---
        const reservaFinalizada = await ReservaService.createNewReserva(reservaData); 

        // Retorna la reserva completa
        return res.status(201).json(reservaFinalizada);

    } catch (error: any) {
        // Manejo de errores específicos
        if (error.message.includes("not found")) {
            return res.status(404).json({ message: error.message });
        }
        if (error.message.includes("already occupied")) {
            return res.status(409).json({ message: "Asiento no disponible. Por favor, selecciona otro." });
        }
        
        // Error genérico del servidor
        console.error("Error al procesar la compra:", error);
        return res.status(500).json({ message: "Error interno al procesar el pago." });
    }
});

export { CompraRouter };