// src/modulos/Usuario.entity.ts

import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("usuarios")
export class Usuario {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true, length: 50, nullable: false })
    username!: string;

    @Column({ length: 100, nullable: false })
    password!: string; // Debe ser un hash (e.g., BCrypt)

    @Column({ length: 20, default: "ADMIN" })
    rol!: string;
}