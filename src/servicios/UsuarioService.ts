// src/servicios/UsuarioService.ts

import { UsuarioRepository } from "../repositorios/UsuarioRepository";
import { Usuario } from "../modulos/Usuario.entity";
// import * as bcrypt from 'bcrypt'; // Usar bcrypt para manejo seguro de contraseñas

export class UsuarioService {

    /**
     * Proceso de login para el panel de administración.
     */
    static async login(username: string, passwordAttempt: string): Promise<Usuario | null> {
        
        const user = await UsuarioRepository.findByUsername(username);

        if (!user) {
            return null; // Usuario no encontrado
        }

        // Simulación de verificación de contraseña (debe ser con bcrypt en producción)
        const passwordMatch = user.password === passwordAttempt; 
        
        // En producción:
        // const passwordMatch = await bcrypt.compare(passwordAttempt, user.password);

        if (passwordMatch) {
            // Retorna el usuario (sin la contraseña en un entorno real)
            return user;
        }

        return null; // Contraseña incorrecta
    }

    /**
     * [CRUD] Crea un nuevo usuario administrador.
     */
    static async createNewUser(userData: Usuario): Promise<Usuario> {
        // En un sistema real:
        // userData.password = await bcrypt.hash(userData.password, 10);
        return UsuarioRepository.save(userData);
    }
}