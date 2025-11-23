import express from "express";
import userRoutes from "./modulos/users/user.routes";

const app = express();

// Middlewares
app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

// Registrar rutas del módulo Users
app.use("/api/users", userRoutes);

export default app;
