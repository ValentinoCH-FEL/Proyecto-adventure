import { Request, Response, Router } from "express";
import { BusService } from "../servicios/BusService";
import { Bus } from "../modulos/Bus.entity";
import { AppDataSource } from "../database/data-source";

const BusRouter = Router();

// ==========================================
// 1. RUTAS DE ADMINISTRACIÓN (CRUD)
// ==========================================

/**
 * POST /api/buses
 * Crea un nuevo bus.
 */
BusRouter.post('/', async (req: Request, res: Response) => {
    try {
        console.log("📥 Recibiendo datos para crear Bus:", req.body);

        const { placa, modelo, capacidadTotal, rutaOrigen, rutaDestino, horaSalida, tarifaBase, tipoServicio } = req.body;

        // Validación básica
        if (!placa || !modelo || !capacidadTotal || !rutaOrigen || !rutaDestino || !horaSalida || !tarifaBase || !tipoServicio) {
            return res.status(400).json({ 
                message: "Faltan datos obligatorios.",
                missing: "Revisa placa, modelo, capacidad, rutas, hora, tarifa y tipo."
            });
        }

        const nuevoBus = new Bus();
        nuevoBus.placa = placa;
        nuevoBus.modelo = modelo;
        nuevoBus.capacidadTotal = Number(capacidadTotal);
        nuevoBus.estadoActivo = true; 
        nuevoBus.rutaOrigen = rutaOrigen;
        nuevoBus.rutaDestino = rutaDestino;
        nuevoBus.horaSalida = horaSalida;
        nuevoBus.tarifaBase = Number(tarifaBase);
        nuevoBus.tipoServicio = tipoServicio;

        const busGuardado = await BusService.saveBus(nuevoBus);
        
        return res.status(201).json(busGuardado);

    } catch (error: any) {
        console.error("❌ Error creando bus:", error);

        // MEJORA PRO: Manejo específico de Placa Duplicada
        if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
            return res.status(409).json({ 
                message: `La placa ${req.body.placa} ya está registrada en el sistema.`,
                error: "PLACA_DUPLICADA"
            });
        }

        return res.status(500).json({ 
            message: "Error al guardar en base de datos.", 
            error: error.message 
        });
    }
});

/**
 * PUT /api/buses/:id
 * Actualiza un bus existente.
 * MEJORA: Usa 'merge' para asegurar que la actualización se haga sobre el registro correcto.
 */
BusRouter.put('/:id', async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const busData = req.body;
        
        const busRepo = AppDataSource.getRepository(Bus);
        const busOriginal = await busRepo.findOneBy({ id });

        if (!busOriginal) {
            return res.status(404).json({ message: "Bus no encontrado para actualizar" });
        }

        // MERGE: Fusionamos los datos nuevos sobre el original
        busRepo.merge(busOriginal, busData);
        const busActualizado = await busRepo.save(busOriginal);

        return res.json(busActualizado);

    } catch (error: any) {
        console.error("Error actualizando bus:", error);

        // MEJORA PRO: Manejo de Placa Duplicada al editar
        if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
            return res.status(409).json({ 
                message: `No se puede actualizar: La placa ${req.body.placa} ya pertenece a otro bus.`,
                error: "PLACA_DUPLICADA"
            });
        }

        return res.status(500).json({ message: "Error interno al actualizar", error: error.message });
    }
});

/**
 * DELETE /api/buses/:id
 * Elimina un bus.
 */
BusRouter.delete('/:id', async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        
        const busRepo = AppDataSource.getRepository(Bus);
        const bus = await busRepo.findOneBy({ id });

        if (!bus) {
            return res.status(404).json({ message: "Bus no encontrado" });
        }

        await busRepo.remove(bus); 
        
        return res.status(200).json({ message: "Bus eliminado correctamente" });
    } catch (error: any) {
        console.error("Error eliminando bus:", error);
        return res.status(500).json({ message: "Error al eliminar bus", error: error.message });
    }
});


// ==========================================
// 2. RUTAS DE BÚSQUEDA Y PÚBLICAS
// ==========================================

/**
 * GET /api/buses/buscar/ruta
 * Busca buses disponibles por ruta.
 */
BusRouter.get('/buscar/ruta', async (req: Request, res: Response) => {
    try {
        const { origen, destino, fecha } = req.query;

        if (!origen || !destino || !fecha) {
            return res.status(400).json({ message: "Faltan datos: origen, destino o fecha" });
        }

        const busRepo = AppDataSource.getRepository(Bus);
        const fechaBuscada = fecha.toString(); 

        const busesEncontrados = await busRepo.find({
            where: {
                rutaOrigen: origen.toString(),
                rutaDestino: destino.toString(),
                estadoActivo: true
            },
            // MEJORA PRO: Ordenar por hora de salida (los más temprano primero)
            order: {
                horaSalida: 'ASC'
            },
            relations: ["asientosOcupados"] 
        });

        // Filtrado en memoria para devolver solo los asientos ocupados de la fecha solicitada
        const resultados = busesEncontrados.map(bus => {
            bus.asientosOcupados = bus.asientosOcupados.filter(asiento => {
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

/**
 * GET /api/buses
 * Obtiene todos los buses.
 */
BusRouter.get('/', async (req: Request, res: Response) => {
    try {
        const buses = await BusService.findAllBuses(); 
        return res.status(200).json(buses);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching data." });
    }
});

/**
 * GET /api/buses/:id
 * Obtiene un bus por ID.
 * CAMBIO APLICADO: Ahora recibe la 'fecha' por query param para filtrar ocupados.
 */
BusRouter.get('/:id', async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        
        // 1. Extraemos la fecha de la URL (ej: ?fecha=2025-12-04)
        const { fecha } = req.query;

        if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });
        
        // 2. Pasamos la fecha al servicio para que filtre los asientos ocupados
        const bus = await BusService.findBusById(id, fecha as string);
        
        if (!bus) return res.status(404).json({ message: "Bus no encontrado" });

        return res.json(bus);
    } catch (error) {
        console.error("Error obteniendo bus por ID:", error);
        return res.status(500).json({ message: "Error interno" });
    }
});

export { BusRouter };