import { Repository, DeepPartial } from "typeorm";
import { AppDataSource } from "../database/data-source";
import { Bus } from "../modulos/Bus.entity";

// Definimos el repositorio base y luego lo extendemos con métodos personalizados.
const BusRepo: Repository<Bus> = AppDataSource.getRepository(Bus);

export class BusRepository {

    /**
     * [READ] Obtiene TODOS los buses (activos e inactivos).
     * Usado por el panel de administración para listar todos los vehículos.
     */
    static async findAll(): Promise<Bus[]> {
        return BusRepo.find();
    }

    /**
     * [READ] Obtiene un bus por su ID, incluyendo relaciones necesarias (como Asientos Ocupados).
     * Usado para el mapa de asientos en el frontend y para la edición en el admin.
     */
    static async findById(id: number): Promise<Bus | null> {
        return BusRepo.findOne({
            where: { id: id },
            relations: ["asientosOcupados"]
        });
    }

    /**
     * [CREATE/UPDATE] Guarda o actualiza un bus.
     * TypeORM maneja esto con el mismo método: si el objeto tiene ID, actualiza; si no, inserta.
     */
    static async save(bus: DeepPartial<Bus>): Promise<Bus> {
        // La firma con DeepPartial permite que se use tanto para crear ({placa: '...'}) 
        // como para actualizar ({id: 5, placa: '...'}).
        return BusRepo.save(bus as DeepPartial<Bus> & Bus);
    }

    /**
     * [DELETE] Elimina un bus por su ID.
     * Incluye verificación para manejar el error si el bus no existe.
     */
    static async deleteById(id: number): Promise<void> {
        // Ejecuta la eliminación
        const result = await BusRepo.delete(id);
        
        // Verifica si la eliminación fue exitosa
        if (result.affected === 0) {
            throw new Error(`Bus con ID ${id} no encontrado para eliminar.`);
        }
    }

    /**
     * [READ] Obtiene solo los buses que están marcados como activos (Para el buscador público).
     */
    static async findByEstadoActivoTrue(): Promise<Bus[]> {
        return BusRepo.find({
            where: { estadoActivo: true },
            order: { horaSalida: "ASC" } 
        });
    }

    /**
     * [READ] Busca buses por fragmento de placa (para el panel de administración).
     */
    static async findByPlacaContainingIgnoreCase(placa: string): Promise<Bus[]> {
        return BusRepo.createQueryBuilder("bus")
            .where("LOWER(bus.placa) LIKE LOWER(:placa)", { placa: `%${placa}%` })
            .getMany();
    }
}