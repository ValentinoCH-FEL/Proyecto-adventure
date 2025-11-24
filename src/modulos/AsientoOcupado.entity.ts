// src/modulos/AsientoOcupado.entity.ts (VERSIÓN CORREGIDA)

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne, Unique } from "typeorm";
import { Bus } from "./Bus.entity";
import { Reserva } from "./Reserva.entity";

@Entity("asientos_ocupados")
@Unique(['bus', 'fechaViaje', 'numeroAsiento'])
export class AsientoOcupado {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Bus, bus => bus.asientosOcupados, { nullable: false })
    bus!: Bus;

    @Column({ type: 'date', nullable: false })
    fechaViaje!: Date;

    @Column({ length: 5, nullable: false })
    numeroAsiento!: string;

    // 1. Añadimos la columna de ID explícitamente para el OneToOne
    @Column({ unique: true }) 
    reservaId!: number; // Columna física en la base de datos

    // 2. La relación OneToOne apunta a esa columna
    @OneToOne(() => Reserva, reserva => reserva.asientoOcupado, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'reservaId' }) // Enlaza la relación a la columna reservaId
    reserva!: Reserva; 
}