import "reflect-metadata"; 
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet'; 
import path from 'path'; 
import fs from 'fs'; 

import { BusRouter } from './controladores/BusController';
import { AutogestionRouter } from './controladores/AutogestionController';
import { CompraRouter } from './controladores/CompraController'; 
import { AdminRouter } from './controladores/AdminController'; 
import { authMiddleware } from './middleware/authMiddleware'; 

const app: Express = express();

// --- 1. SEGURIDAD EXTREMA ---
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"], 
            scriptSrc: ["'self'", "https://api.qrserver.com"], 
            styleSrc: ["'self'", "https://fonts.googleapis.com"], 
            imgSrc: ["'self'", "data:", "https://api.qrserver.com"], 
            connectSrc: ["'self'", "http://localhost:3000"], 
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
            formAction: ["'self'"],      
            frameAncestors: ["'self'"], 
        },
    },
    strictTransportSecurity: {
        maxAge: 31536000, 
        includeSubDomains: true,
        preload: true
    },
    crossOriginEmbedderPolicy: false,
    xPoweredBy: false 
}));

// --- 2. LIMPIEZA DE CABECERAS (ANTI-TIMESTAMP) ---
app.disable('etag'); // Desactiva hash global

// Middleware forzado para borrar cabeceras en cada respuesta API
app.use((req: Request, res: Response, next: NextFunction) => {
    res.removeHeader('X-Powered-By');
    // Forzamos la cabecera HSTS una vez más por si acaso
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    next();
});

app.use(express.json());

app.use(cors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
}));

// --- 3. RUTAS API ---
app.use('/api/buses', BusRouter); 
app.use('/api/autogestion', AutogestionRouter); 
app.use('/api/compra', CompraRouter); 
app.use('/api/admin', AdminRouter); 
app.use('/api/admin/buses', authMiddleware, BusRouter); 

// --- 4. SERVIR FRONTEND (MODO SILENCIOSO) ---
let frontendPath = path.join(__dirname, '../adventure-bus/dist/adventure-bus');
if (fs.existsSync(path.join(frontendPath, 'browser'))) {
    frontendPath = path.join(frontendPath, 'browser');
}

// VALIDACIÓN
if (fs.existsSync(path.join(frontendPath, 'index.html'))) {
    console.log(`✅ Frontend detectado en: ${frontendPath}`);
} else {
    console.warn(`⚠️ ADVERTENCIA: Ejecuta 'ng build'.`);
}

// AQUÍ ESTÁ EL CAMBIO CLAVE:
// Configuramos express.static para que NO envíe fechas de modificación ni ETags.
// Esto elimina la alerta de "Divulgación de Marcas de Tiempo".
app.use(express.static(frontendPath, {
    etag: false,         // Desactiva ETag para archivos estáticos
    lastModified: false, // Desactiva Last-Modified para archivos estáticos
    setHeaders: (res) => {
        // Aseguramos que no se escape nada
        res.removeHeader('X-Powered-By');
    }
}));

// Catch-All
app.use((req, res, next) => {
    if (req.path.startsWith('/api')) { return next(); }
    
    const indexPath = path.join(frontendPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Error 404');
    }
});

export default app;