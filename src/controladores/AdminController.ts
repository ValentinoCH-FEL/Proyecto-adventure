// src/controladores/AdminController.ts

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
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username y password son requeridos." });
    }

    try {
        const user = await UsuarioService.login(username, password);

        if (!user) {
            return res.status(401).json({ message: "Credenciales inválidas." });
        }

        // 1. Crear el payload del token (solo información no sensible)
        const tokenPayload = {
            id: user.id,
            username: user.username,
            rol: user.rol 
        };

        // 2. Generar el JWT con expiración de 1 hora
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });

        return res.status(200).json({ 
            message: "Login exitoso",
            token: token, // <-- El token que se debe usar en peticiones futuras
            user: { id: user.id, username: user.username, rol: user.rol }
        });

    } catch (error) {
        console.error("Error during admin login:", error);
        return res.status(500).json({ message: "Error interno del servidor." });
    }
});

export { AdminRouter };