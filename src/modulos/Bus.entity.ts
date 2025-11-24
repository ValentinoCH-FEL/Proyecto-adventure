// src/modulos/Bus.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
// Asegúrate de que los archivos de las entidades Reserva y AsientoOcupado existan
// y terminen en .ts, .js o .entity.ts, según tu configuración de tsconfig.json.
import { Reserva } from "./Reserva.entity"; 
import { AsientoOcupado } from "./AsientoOcupado.entity";

@Entity("buses")
export class Bus {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true, length: 10, nullable: false })
    placa!: string;

    @Column({ length: 50, nullable: false })
    modelo!: string;

    @Column({ type: "int", nullable: false })
    capacidadTotal!: number;

    @Column({ default: true })
    estadoActivo!: boolean;

    @Column({ length: 100, nullable: false })
    rutaOrigen!: string;

    @Column({ length: 100, nullable: false })
    rutaDestino!: string;

    @Column({ type: 'time', nullable: false })
    horaSalida!: string; 

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    tarifaBase!: number;

    @Column({ length: 50, nullable: false })
    tipoServicio!: string; // Suite, Evolution, Clásico

    // RELACIONES: Se utiliza la función de flecha () => Clase para TypeORM 
    // y se asegura que el tipo sea un array de la entidad.
    
    @OneToMany(() => Reserva, reserva => reserva.bus)
    reservas!: Reserva[]; // <- Dependencia: Reserva.entity.ts

    @OneToMany(() => AsientoOcupado, asientoOcupado => asientoOcupado.bus)
    asientosOcupados!: AsientoOcupado[]; // <- Dependencia: AsientoOcupado.entity.ts
}