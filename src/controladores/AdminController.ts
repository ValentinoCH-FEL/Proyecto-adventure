import { Request, Response, Router } from "express";
import * as jwt from 'jsonwebtoken'; 
import { UsuarioService } from "../servicios/UsuarioService";

const AdminRouter = Router();

// Define tu clave secreta de forma segura (¡Usar variable de entorno en producción!)
const JWT_SECRET = process.env.JWT_SECRET || "tu_clave_super_secreta_aqui";

/**
 * POST /api/admin/login
 * Procesa el inicio de sesión del administrador y genera un token.
 */
AdminRouter.post('/login', async (req: Request, res: Response) => {
    // CORRECCIÓN CLAVE: Aceptamos 'usuario' y 'password' que es lo que envía el Frontend.
    const { usuario, password } = req.body; 

    // Verificamos los campos requeridos
    if (!usuario || !password) {
        return res.status(400).json({ message: "Usuario y contraseña son requeridos." });
    }

    try {
        // 1. Validar las credenciales usando la función 'login' del servicio.
        // El servicio espera 'username' y 'password', pero usaremos 'usuario' aquí
        // porque el Frontend lo manda como 'usuario'.
        const user = await UsuarioService.login(usuario, password);

        if (!user) {
            // Falla si el usuario no existe o la contraseña no coincide
            return res.status(401).json({ message: "Credenciales inválidas." });
        }

        // 2. Crear el payload del token (información no sensible)
        const tokenPayload = {
            id: user.id,
            username: user.username, // Usamos el nombre de usuario de la BD
            rol: user.rol 
        };

        // 3. Generar el JWT con expiración de 1 hora
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });

        return res.status(200).json({ 
            message: "Login exitoso",
            token: token, 
            user: { id: user.id, username: user.username, rol: user.rol }
        });

    } catch (error) {
        console.error("Error during admin login:", error);
        return res.status(500).json({ message: "Error interno del servidor." });
    }
});

export { AdminRouter };