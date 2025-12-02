import { AppDataSource } from '../database/data-source';
import { Usuario } from '../modulos/Usuario.entity';
import * as bcrypt from 'bcrypt';
import { UsuarioRepository } from "../repositorios/UsuarioRepository"; 

export class UsuarioService {

    private static userRepo = AppDataSource.getRepository(Usuario);

    /**
     * Proceso de login para el panel de administración.
     * @param username El nombre de usuario (ADMIN).
     * @param passwordAttempt La contraseña tecleada (12345).
     * @returns Usuario si es válido, null si falla.
     */
    static async login(username: string, passwordAttempt: string): Promise<Usuario | null> {
        
        // 1. Buscar al usuario por nombre de usuario
        const user = await this.userRepo.findOneBy({ username: username });

        if (!user) {
            return null; // Usuario no encontrado
        }

        // 2. CLAVE: Comparar la contraseña tecleada (passwordAttempt) con el hash de la DB (user.password)
        // Esto es lo que estaba fallando, TypeORM no puede comparar texto plano con el hash.
        const passwordMatch = await bcrypt.compare(passwordAttempt, user.password);

        if (passwordMatch) {
            return user; // Credenciales VÁLIDAS
        } else {
            return null; // Contraseña INCORRECTA
        }
    }

    /**
     * [CRUD] Crea un nuevo usuario administrador (usado para la configuración inicial).
     */
    static async createNewUser(userData: Usuario): Promise<Usuario> {
        // En un sistema real:
        // userData.password = await bcrypt.hash(userData.password, 10);
        return UsuarioRepository.save(userData);
    }
    
    // ... [Aquí irían otros métodos de servicio] ...
}