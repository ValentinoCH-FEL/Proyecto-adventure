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
        
        // 1. Instancia del repositorio
        const busRepo = AppDataSource.getRepository(Bus);

        // 2. Buscamos el bus original en la BD
        const busOriginal = await busRepo.findOneBy({ id });

        if (!busOriginal) {
            return res.status(404).json({ message: "Bus no encontrado para actualizar" });
        }

        // 3. MERGE: Fusionamos los datos nuevos sobre el original
        // Esto mantiene el mismo ID y solo cambia lo que enviaste
        busRepo.merge(busOriginal, busData);

        // 4. Guardamos el objeto fusionado
        const busActualizado = await busRepo.save(busOriginal);

        return res.json(busActualizado);

    } catch (error: any) {
        console.error("Error actualizando bus:", error);
        return res.status(500).json({ message: "Error interno al actualizar", error: error.message });
    }
});

/**
 * DELETE /api/buses/:id
 * Elimina un bus.
 * NOTA: Gracias al cambio en Bus.entity.ts (CASCADE), esto ahora borrará
 * automáticamente las reservas y asientos asociados sin dar error.
 */
BusRouter.delete('/:id', async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        
        // Verificamos si existe antes de borrar (opcional, pero buena práctica)
        const busRepo = AppDataSource.getRepository(Bus);
        const bus = await busRepo.findOneBy({ id });

        if (!bus) {
            return res.status(404).json({ message: "Bus no encontrado" });
        }

        await busRepo.remove(bus); // Usamos remove del repo directamente para activar los cascades de TypeORM
        
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
            relations: ["asientosOcupados"] 
        });

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
 */
BusRouter.get('/:id', async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });
        
        const bus = await BusService.findBusById(id);
        if (!bus) return res.status(404).json({ message: "Bus no encontrado" });

        return res.json(bus);
    } catch (error) {
        return res.status(500).json({ message: "Error interno" });
    }
});

export { BusRouter };