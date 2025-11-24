// src/app.ts (Versión final con rutas protegidas)

import "reflect-metadata"; // Debe ser la primera línea para los decoradores de TypeORM
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { AppDataSource } from './database/data-source'; // Importa tu configuración de DB

// --- IMPORTACIÓN DE CONTROLADORES Y MIDDLEWARE ---
import { BusRouter } from './controladores/BusController';
import { AutogestionRouter } from './controladores/AutogestionController';
import { CompraRouter } from './controladores/CompraController'; 
import { AdminRouter } from './controladores/AdminController'; 
import { authMiddleware } from './middleware/authMiddleware'; // <-- IMPORTACIÓN DEL MIDDLEWARE DE PROTECCIÓN

const app: Express = express();
const PORT = 3000; 

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json()); // Permite recibir JSON en el body de las peticiones

// --- INICIALIZACIÓN DE LA BASE DE DATOS ---
AppDataSource.initialize()
    .then(() => {
        console.log("✅ Conectado a la base de datos MySQL (TypeORM)");
    })
    .catch((error) => {
        console.error("❌ Error al conectar a la base de datos:", error);
        process.exit(1); // Detiene la aplicación si la DB falla
    });

// --- RUTAS API ---

// 1. Rutas Públicas de Información (Home, Viajes)
app.use('/api/buses', BusRouter); 

// 2. Rutas de Autogestión (Buscar y Cancelar reserva)
app.use('/api/autogestion', AutogestionRouter); 

// 3. Rutas de Compra (Checkout y Pago Final)
app.use('/api/compra', CompraRouter); 

// 4. Rutas de Administración

// 4.1 Login (Pública, ya que necesita generar el token)
app.use('/api/admin', AdminRouter); 

// 4.2 CRUD de Buses (Ruta Protegida)
// Se aplica el authMiddleware. Solo se ejecutarán las rutas de BusRouter si el JWT es válido.
app.use('/api/admin/buses', authMiddleware, BusRouter); 

app.listen(PORT, () => {
    console.log(`🚀 Servidor Express.js corriendo en http://localhost:${PORT}`);
});

export default app;