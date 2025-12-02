import "reflect-metadata";
import { AppDataSource } from "./database/data-source";
import app from "./app"; 
// IMPORTAMOS LA FUNCIÓN PARA CREAR EL ADMIN
import { setupAdminUser } from './database/initialSetup'; 

// conexión a la base de datos
AppDataSource.initialize()
  .then(async () => { // <--- CLAVE: Agregamos 'async' aquí
    console.log("📌 Conectado a la base de datos MySQL");
    
    // LLAMAMOS A LA FUNCIÓN DE CONFIGURACIÓN
    await setupAdminUser(); // Esto crea el usuario 'ADMIN' con la contraseña encriptada.
    
    app.listen(3000, () => {
      console.log("🚀 Servidor corriendo en http://localhost:3000");
    });
  })
  .catch((error) => console.error("❌ Error de conexión:", error));