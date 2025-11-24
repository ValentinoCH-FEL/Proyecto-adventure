// src/dtos/Compra.dto.ts

export interface CompraRequestDTO {
    // Datos del Viaje
    busId: number;
    asientoNumero: string;
    fechaViaje: string; // Formato esperado: "YYYY-MM-DD"
    precioPagado: number;

    // Datos del Pasajero
    tipoDocumento: string;
    numeroDocumento: string;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    correoElectronico: string;
    fechaNacimiento: string; // Formato esperado: "YYYY-MM-DD"
    nacionalidad: string;
    genero: string;

    // (Aquí podrías agregar datos simulados de tarjeta o pago real)
    // numeroTarjeta: string;
    // cvv: string;
}