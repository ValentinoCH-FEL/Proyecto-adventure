// src/repositorios/BusRepository.ts

import { Repository } from "typeorm";
import { AppDataSource } from "../database/data-source";
import { Bus } from "../modulos/Bus.entity";

// Exportamos la instancia base del repositorio
const BusRepo: Repository<Bus> = AppDataSource.getRepository(Bus);

export class BusRepository {

    /**
     * Obtiene todos los buses.
     */
    static async findAll(): Promise<Bus[]> {
        return BusRepo.find();
    }

    /**
     * Obtiene un bus por su ID.
     */
    static async findById(id: number): Promise<Bus | null> {
        return BusRepo.findOneBy({ id });
    }

    /**
     * Guarda o actualiza un bus.
     */
    static async save(bus: Bus): Promise<Bus> {
        return BusRepo.save(bus);
    }

    /**
     * Elimina un bus por su ID.
     */
    static async deleteById(id: number): Promise<void> {
        // En TypeORM, delete lanza una excepción si la fila no existe
        await BusRepo.delete(id);
    }

    // --- Lógica de Búsqueda Especializada (Similares a Spring Data JPA) ---

    /**
     * Obtiene solo los buses que están marcados como activos para la vista pública (image_4a3aa6.png).
     */
    static async findByEstadoActivoTrue(): Promise<Bus[]> {
        return BusRepo.find({
            where: { estadoActivo: true },
            order: { horaSalida: "ASC" } 
        });
    }
    
    /**
     * Busca buses por fragmento de placa, ignorando mayúsculas/minúsculas.
     * Útil para el panel de administración (image_4a3a87.png).
     */
    static async findByPlacaContainingIgnoreCase(placa: string): Promise<Bus[]> {
        return BusRepo.createQueryBuilder("bus")
            .where("LOWER(bus.placa) LIKE LOWER(:placa)", { placa: `%${placa}%` })
            .getMany();
    }
}