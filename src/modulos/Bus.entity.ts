import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
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

    // ===================================================================
    // RELACIONES CON CASCADA (Corrección para poder ELIMINAR buses)
    // ===================================================================
    
    // Si borras el Bus, se borran sus reservas automáticamente
    @OneToMany(() => Reserva, reserva => reserva.bus, { 
        cascade: true, 
        onDelete: 'CASCADE' 
    })
    reservas!: Reserva[];

    // Si borras el Bus, se limpia el historial de asientos ocupados
    @OneToMany(() => AsientoOcupado, asientoOcupado => asientoOcupado.bus, { 
        cascade: true, 
        onDelete: 'CASCADE' 
    })
    asientosOcupados!: AsientoOcupado[];
}