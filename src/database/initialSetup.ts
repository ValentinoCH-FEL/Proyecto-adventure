import * as bcrypt from 'bcrypt';
import { AppDataSource } from './data-source';
import { Usuario } from '../modulos/Usuario.entity'; // Asegúrate de que esta ruta sea correcta

/**
 * Función para verificar y crear el usuario administrador inicial.
 * La contraseña se encripta (hashing) para seguridad.
 */
export async function setupAdminUser() {
    // Repositorio para la tabla de usuarios
    const userRepository = AppDataSource.getRepository(Usuario);
    const ADMIN_USERNAME = "ADMIN";
    const ADMIN_PASSWORD = "12345"; // Contraseña que usaremos para iniciar sesión

    try {
        // 1. Verificar si el administrador ya existe
        let admin = await userRepository.findOneBy({ username: ADMIN_USERNAME });

        if (!admin) {
            console.log("⚙️ Creando usuario administrador inicial...");

            // 2. Encriptar la contraseña (Hashing)
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, saltRounds); 

            // 3. Crear el nuevo usuario
            const newAdmin = userRepository.create({
                username: ADMIN_USERNAME,
                password: hashedPassword, // GUARDAMOS EL HASH (versión encriptada)
                rol: "ADMIN" // Asegúrate de que este rol exista en tu entidad
            });

            await userRepository.save(newAdmin);
            console.log(`✅ Usuario Admin '${ADMIN_USERNAME}' creado. Contraseña: ${ADMIN_PASSWORD}.`);
        } else {
            console.log(`✔️ Usuario Admin '${ADMIN_USERNAME}' ya existe.`);
        }
    } catch (error) {
        console.error("❌ Error en setupAdminUser. ¿La tabla 'usuarios' existe?", error);
    }
}