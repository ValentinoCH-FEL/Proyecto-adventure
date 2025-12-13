import "reflect-metadata";
import { AppDataSource } from "./database/data-source";
import app from "./app"; // Importamos la aplicación Express definida en app.ts
// IMPORTAMOS LA FUNCIÓN PARA CREAR EL ADMIN
import { setupAdminUser } from './database/initialSetup'; 

const PORT = 3000;

// --- CONEXIÓN A LA BASE DE DATOS E INICIO DEL SERVIDOR ---
AppDataSource.initialize()
  .then(async () => {
    console.log("📌 Conectado a la base de datos MySQL");
    
    // LLAMAMOS A LA FUNCIÓN DE CONFIGURACIÓN
    await setupAdminUser(); // Esto crea el usuario 'ADMIN' con la contraseña encriptada.
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => console.error("❌ Error de conexión:", error));