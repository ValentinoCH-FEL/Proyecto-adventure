// src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

// Define tu clave secreta de forma segura (debe ser la misma que en AdminController)
const JWT_SECRET = process.env.JWT_SECRET || "tu_clave_super_secreta_aqui";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // 1. Obtener el encabezado de autorización
    const authHeader = req.headers['authorization'];
    
    // El formato esperado es "Bearer <token>"
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        // No hay token, acceso denegado
        return res.status(401).json({ message: "Acceso denegado. Token no proporcionado." }); 
    }

    // 2. Verificar el token
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            // El token es inválido o expiró
            return res.status(403).json({ message: "Token inválido o expirado." }); 
        }

        // Si es válido, adjuntamos la información del usuario a la solicitud
        // (Aunque para el CRUD de Bus no es estrictamente necesario, es buena práctica)
        (req as any).user = user; 
        
        // 3. Pasar al siguiente controlador
        next();
    });
};