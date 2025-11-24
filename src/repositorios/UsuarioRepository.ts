// src/repositorios/UsuarioRepository.ts

import { Repository } from "typeorm";
import { AppDataSource } from "../database/data-source";
import { Usuario } from "../modulos/Usuario.entity";

const UsuarioRepo: Repository<Usuario> = AppDataSource.getRepository(Usuario);

export class UsuarioRepository {

    /**
     * Busca un usuario por su nombre de usuario para el login.
     */
    static async findByUsername(username: string): Promise<Usuario | null> {
        return UsuarioRepo.findOneBy({ username });
    }

    /**
     * Guarda un nuevo usuario.
     */
    static async save(usuario: Usuario): Promise<Usuario> {
        return UsuarioRepo.save(usuario);
    }
}