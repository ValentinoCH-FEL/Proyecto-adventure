// src/servicios/PasajeroService.ts (VERSIÓN CORREGIDA Y MEJORADA)

import { AppDataSource } from "../database/data-source";
import { Pasajero } from "../modulos/Pasajero.entity";
import { PasajeroRepository } from "../repositorios/PasajeroRepository";
import { Repository } from "typeorm";

// ⚠️ Interfaz que define la forma de los datos que llegan desde CompraController
// Usamos el mismo formato que configuramos en CompraController
interface PasajeroDataDTO {
    tipoDocumento: string;
    numeroDocumento: string;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    correoElectronico: string;
    fechaNacimiento: Date; 
    nacionalidad: string;
    genero: string;
}


export class PasajeroService {
    
    // Si usas repositorios personalizados, NO necesitas esta línea, 
    // pero si usas el repositorio estándar, se ve así:
    private static PasajeroStdRepository: Repository<Pasajero> = 
        AppDataSource.getRepository(Pasajero);


    /**
     * Busca un pasajero por su documento o correo. Si no existe, lo crea e inserta.
     * Ahora recibe un objeto simple (PasajeroDataDTO) para desvincularlo de la entidad.
     * @param data Objeto simple con los datos del pasajero.
     * @returns La entidad Pasajero existente o recién creada.
     */
    static async findOrCreatePasajero(data: PasajeroDataDTO): Promise<Pasajero> {
        
        // 1. Intentar encontrar por Documento o Correo (doble verificación)
        let existingPasajero = await PasajeroRepository.findByNumeroDocumento(data.numeroDocumento);
        
        if (!existingPasajero) {
             // Si no lo encuentra por documento, intenta por correo (es una buena práctica)
             existingPasajero = await this.PasajeroStdRepository.findOne({
                 where: { correoElectronico: data.correoElectronico },
             });
        }
        
        if (existingPasajero) {
            // 2. Si existe, lo retornamos.
            return existingPasajero;
        }

        // 3. Si no existe, creamos la entidad y la guardamos.
        // Creamos una nueva entidad Pasajero
        const nuevoPasajero = new Pasajero();
        
        // Asignamos todos los campos del objeto simple (data) a la nueva entidad (nuevoPasajero)
        Object.assign(nuevoPasajero, data);
        
        // Usamos el repositorio para guardar la nueva entidad
        const newPasajero = await PasajeroRepository.save(nuevoPasajero);
        
        return newPasajero;
    }

    /**
     * Busca un pasajero por su ID.
     */
    static async findPasajeroById(id: number): Promise<Pasajero | null> {
        return PasajeroRepository.findById(id);
    }
}