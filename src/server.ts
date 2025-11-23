import "reflect-metadata";
import { AppDataSource } from "./database/data-source";
import app from "./app";  // IMPORTA TU APP AQUI

// conexión a la base de datos
AppDataSource.initialize()
  .then(() => {
    console.log("📌 Conectado a la base de datos MySQL");
    app.listen(3000, () => {
      console.log("🚀 Servidor corriendo en http://localhost:3000");
    });
  })
  .catch((error) => console.error("❌ Error de conexión:", error));
