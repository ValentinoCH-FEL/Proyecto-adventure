import { Request, Response, Router } from "express";
import { BusService } from "../servicios/BusService";
import { Bus } from "../modulos/Bus.entity";
import { AppDataSource } from "../database/data-source"; // Agregado para usar el repositorio directamente en la búsqueda
// import { AsientoOcupadoService } from "../servicios/AsientoOcupadoService"; // Descomenta si lo usas

const BusRouter = Router();

// ==========================================
// 1. RUTAS ESPECÍFICAS (Deben ir PRIMERO)
// ==========================================

/**
 * GET /api/buses/buscar/ruta
 * Busca viajes por origen, destino y fecha.
 * IMPORTANTE: Esta ruta debe ir ANTES de /:id para que no se confunda 'buscar' con un ID.
 */
BusRouter.get('/buscar/ruta', async (req: Request, res: Response) => {
    try {
        const { origen, destino, fecha } = req.query;

        if (!origen || !destino || !fecha) {
            return res.status(400).json({ message: "Faltan datos: origen, destino o fecha" });
        }

        const busRepo = AppDataSource.getRepository(Bus);
        const fechaBuscada = fecha.toString(); // "2024-11-29"

        // 1. Buscamos los buses SOLO por ruta y estado
        const busesEncontrados = await busRepo.find({
            where: {
                rutaOrigen: origen.toString(),
                rutaDestino: destino.toString(),
                estadoActivo: true
            },
            relations: ["asientosOcupados"] // Traemos el historial de ventas
        });

        // 2. FILTRADO EN MEMORIA (MAGIA ✨)
        // Recorremos cada bus y limpiamos su lista de asientos ocupados
        // para dejar solo los que coinciden con la fecha buscada.
        const resultados = busesEncontrados.map(bus => {
            // Filtramos el array de asientos dentro del objeto bus
            bus.asientosOcupados = bus.asientosOcupados.filter(asiento => {
                // Convertimos la fecha del asiento a string YYYY-MM-DD para comparar
                // Nota: Asumiendo que asiento.fechaViaje viene como string o Date
                const fechaAsiento = new Date(asiento.fechaViaje).toISOString().split('T')[0];
                return fechaAsiento === fechaBuscada;
            });
            return bus;
        });

        return res.json(resultados);

    } catch (error) {
        console.error("Error buscando rutas:", error);
        return res.status(500).json({ message: "Error al buscar rutas" });
    }
});


// ==========================================
// 2. RUTAS GENÉRICAS (Van DESPUÉS)
// ==========================================

/**
 * GET /api/buses
 * Obtiene todos los buses activos (para el Home/Buscador).
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

/**
 * GET /api/buses/:id
 * Obtiene un bus por su ID e incluye los asientos ocupados.
 * Angular llama a esta ruta para dibujar el mapa de asientos.
 */
BusRouter.get('/:id', async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        // Validar que el ID sea un número
        if (isNaN(id)) {
            return res.status(400).json({ message: "ID inválido" });
        }
        
        // Llamamos al servicio para buscar el bus
        const bus = await BusService.findBusById(id);

        // Si no existe, devolvemos 404
        if (!bus) {
            return res.status(404).json({ message: "Bus no encontrado" });
        }

        // Si existe, devolvemos el bus con sus asientos
        return res.json(bus);
    } catch (error) {
        console.error("Error al obtener bus:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
});


// ==========================================
// 3. RUTAS ADMIN (POST, PUT, DELETE)
// ==========================================

/**
 * POST /api/buses/admin
 * Crea un nuevo bus en la base de datos.
 */
BusRouter.post('/admin', async (req: Request, res: Response) => {
    try {
        // Validaciones básicas
        if (!req.body.placa || !req.body.modelo) {
            return res.status(400).json({ message: "Placa y Modelo son obligatorios." });
        }
        
        const newBus = await BusService.saveBus(req.body as Bus);
        return res.status(201).json(newBus);
    } catch (error: any) {
        console.error("Error creating bus:", error);
        return res.status(500).json({ message: "Error saving bus data." });
    }
});

// Exportamos el Router para usarlo en app.ts o server.ts
export { BusRouter };