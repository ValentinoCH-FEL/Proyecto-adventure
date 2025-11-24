// src/controladores/BusController.ts

import { Request, Response, Router } from "express";
import { BusService } from "../servicios/BusService";
import { Bus } from "../modulos/Bus.entity";
import { AsientoOcupadoService } from "../servicios/AsientoOcupadoService";

const BusRouter = Router();

// --- RUTAS PÚBLICAS (/api/buses) ---
// ... (Tus funciones GET / y GET /:id/asientos aquí) ...

/**
 * GET /api/buses
 */
BusRouter.get('/', async (req: Request, res: Response) => {
    try {
        const buses = await BusService.findActiveTrips();
        return res.status(200).json(buses);
    } catch (error) {
        console.error("Error fetching active buses:", error);
        return res.status(500).json({ message: "Error fetching data." });
    }
});

// ... (El resto de las funciones GET públicas y POST/GET/DELETE de /admin) ...

// --- Ejemplo de una de las funciones protegidas (Si están mal, rompe la compilación) ---

/**
 * POST /api/admin/buses
 */
BusRouter.post('/admin', async (req: Request, res: Response) => {
    try {
        if (!req.body.placa || !req.body.modelo) {
            return res.status(400).json({ message: "Placa and Modelo are required." });
        }
        
        const newBus = await BusService.saveBus(req.body as Bus);
        return res.status(201).json(newBus);
    } catch (error: any) {
        console.error("Error creating bus:", error);
        return res.status(500).json({ message: "Error saving bus data." });
    }
});


export { BusRouter }; // <-- Asegúrate de que esta línea esté presente