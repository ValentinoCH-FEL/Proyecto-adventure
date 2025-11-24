// src/database/data-source.ts

import "reflect-metadata";
import { DataSource } from "typeorm";
import { Usuario } from "../modulos/Usuario.entity";
import { Bus } from "../modulos/Bus.entity";
import { Pasajero } from "../modulos/Pasajero.entity";
import { Reserva } from "../modulos/Reserva.entity";
import { AsientoOcupado } from "../modulos/AsientoOcupado.entity";

// src/database/data-source.ts

export const AppDataSource = new DataSource({
    type: "mysql", 
    host: "localhost",
    port: 3306, 
    username: "root",       // <--- ¡CAMBIAR! Usuario por defecto de XAMPP es 'root'
    password: "",           // <--- ¡CAMBIAR! La contraseña por defecto suele ser vacía (string vacío)
    database: "adventure_api_db", 
    synchronize: true,      // <--- CLAVE: Esto hará la magia de crear las tablas
    logging: false, 
    entities: [Usuario, Bus, Pasajero, Reserva, AsientoOcupado],
    migrations: [],
    subscribers: [],
});