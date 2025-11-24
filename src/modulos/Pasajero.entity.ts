// src/modulos/Pasajero.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Reserva } from "./Reserva.entity";

@Entity("pasajeros")
export class Pasajero {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 20, nullable: false })
    tipoDocumento!: string;

    @Column({ length: 20, nullable: false })
    numeroDocumento!: string;

    @Column({ length: 100, nullable: false })
    nombres!: string;

    @Column({ length: 100, nullable: false })
    apellidoPaterno!: string;

    @Column({ length: 100, nullable: true })
    apellidoMaterno!: string;

    @Column({ nullable: false })
    correoElectronico!: string;

    @Column({ type: 'date', nullable: false })
    fechaNacimiento!: Date; // TypeORM mapea el tipo 'date' a Date de JS

    @Column({ length: 50, nullable: false })
    nacionalidad!: string;

    @Column({ length: 20, nullable: false })
    genero!: string;

    @OneToMany(() => Reserva, reserva => reserva.pasajero)
    reservas!: Reserva[]; // Relación con los tickets comprados
}