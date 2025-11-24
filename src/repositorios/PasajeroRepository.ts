// src/repositorios/PasajeroRepository.ts

import { Repository } from "typeorm";
import { AppDataSource } from "../database/data-source";
import { Pasajero } from "../modulos/Pasajero.entity";

const PasajeroRepo: Repository<Pasajero> = AppDataSource.getRepository(Pasajero);

export class PasajeroRepository {

    /**
     * Busca un pasajero por su ID.
     */
    static async findById(id: number): Promise<Pasajero | null> {
        return PasajeroRepo.findOneBy({ id });
    }

    /**
     * Busca un pasajero por su número de documento.
     * Es clave para el findOrCreatePasajero en el servicio.
     */
    static async findByNumeroDocumento(numeroDocumento: string): Promise<Pasajero | null> {
        return PasajeroRepo.findOneBy({ numeroDocumento });
    }

    /**
     * Guarda o actualiza un pasajero.
     */
    static async save(pasajero: Pasajero): Promise<Pasajero> {
        return PasajeroRepo.save(pasajero);
    }
}