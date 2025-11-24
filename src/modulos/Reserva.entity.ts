// src/modulos/Reserva.entity.ts (VERSIÓN CORREGIDA)

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from "typeorm";
import { Bus } from "./Bus.entity";
import { Pasajero } from "./Pasajero.entity";
import { AsientoOcupado } from "./AsientoOcupado.entity";

@Entity("reservas")
export class Reserva {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true, length: 10, nullable: false })
    codigoReserva!: string; 

    @ManyToOne(() => Bus, bus => bus.reservas, { nullable: false })
    bus!: Bus; 

    @ManyToOne(() => Pasajero, pasajero => pasajero.reservas, { nullable: false, cascade: true })
    pasajero!: Pasajero; 

    @Column({ length: 5, nullable: false })
    asientoNumero!: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    precioPagado!: number;

    @Column({ type: 'date', nullable: false })
    fechaViaje!: Date;

    @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP", nullable: false })
    fechaCompra!: Date;

    @Column({ length: 20, default: "CONFIRMADA" })
    estadoReserva!: string;

    // La relación inversa del OneToOne. No necesita JoinColumn.
    @OneToOne(() => AsientoOcupado, asiento => asiento.reserva)
    asientoOcupado!: AsientoOcupado;
}