import { Request, Response, Router } from "express";
import { ReservaService } from "../servicios/ReservaService";
import nodemailer from "nodemailer";

const CompraRouter = Router();

// --- CONFIGURACIÓN GMAIL ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'Calderonhurtadovalentino@gmail.com', // <--- TU CORREO QUE ENVÍA
        pass: 'kohozxovxclzlmuh'// <--- TU CLAVE DE APLICACIÓN
    }
});

/**
 * POST /api/compra
 * Recibe la lista de pasajeros y genera las reservas.
 */
CompraRouter.post('/', async (req: Request, res: Response) => {
    
    // Cambiamos el nombre de la variable de fechaViaje a fechaViajeStr 
    // para usar una variable convertida dentro del bucle.
    const { busId, fechaViaje: fechaViajeStr, pasajeros, total, metodoPago } = req.body;
    const reservasCreadas = [];
    
    // Convertir la fecha del viaje UNA VEZ a objeto Date
    const fechaViajeObjeto = new Date(fechaViajeStr); // <-- CLAVE: Conversión anticipada

    try {
        // 1. Validar que lleguen pasajeros
        if (!pasajeros || !Array.isArray(pasajeros) || pasajeros.length === 0) {
            return res.status(400).json({ message: "No hay pasajeros en la solicitud." });
        }

        // 2. Extraer datos para el correo
        const correoTitular = pasajeros[0].correoElectronico;
        const nombreTitular = pasajeros[0].nombres;
        
        // 3. Bucle para guardar CADA pasajero/reserva en la BD
        for (const p of pasajeros) {
            
            // Convertir la fecha de nacimiento del pasajero a objeto Date
            const fechaNacimientoObjeto = new Date(p.fechaNacimiento); // <-- CLAVE: Conversión de fecha de nacimiento

            const reservaData = {
                busId: busId,
                fechaViaje: fechaViajeObjeto, // Objeto Date (para Reserva)
                asientoNumero: p.asientoNumero,
                precioPagado: p.precio,
                pasajeroData: {
                    // Mapeo directo de todos los campos que espera la entidad Pasajero
                    tipoDocumento: p.tipoDocumento,
                    numeroDocumento: p.numeroDocumento,
                    nombres: p.nombres,
                    apellidoPaterno: p.apellidoPaterno,
                    apellidoMaterno: p.apellidoMaterno,
                    correoElectronico: p.correoElectronico,
                    fechaNacimiento: fechaNacimientoObjeto, // Usamos el objeto Date
                    nacionalidad: p.nacionalidad,
                    genero: p.genero,
                }
            };
            
            // Llamamos al servicio por cada asiento (guarda Pasajero, Reserva, AsientoOcupado)
            const nuevaReserva = await ReservaService.createNewReserva(reservaData);
            reservasCreadas.push(nuevaReserva);
        }
        
        // 4. Enviar el correo AL TITULAR (Dinámico)
        try {
            console.log(`Enviando correo a: ${correoTitular}`);
            
            // OBTIENE LA RUTA COMPLETA DEL PRIMER OBJETO CREADO PARA EL EMAIL
            const rutaOrigen = reservasCreadas[0].bus.rutaOrigen;
            const rutaDestino = reservasCreadas[0].bus.rutaDestino;

            await transporter.sendMail({
                from: '"Adventure Bus 🚌" <tu_correo_proyecto@gmail.com>',
                to: correoTitular, 
                subject: "¡Tu viaje está confirmado! - Adventure Bus",
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; max-width: 600px;">
                        <h2 style="color: #011638;">¡Hola ${nombreTitular}!</h2>
                        <p>Tu compra de <strong>${pasajeros.length} pasajes</strong> ha sido exitosa.</p>
                        
                        <div style="background: #f4f7f6; padding: 15px; margin: 20px 0; border-radius: 8px;">
                            <p><strong>Ruta:</strong> ${rutaOrigen} a ${rutaDestino}</p>
                            <p><strong>Fecha:</strong> ${fechaViajeStr}</p>
                            <p><strong>Total Pagado:</strong> S/ ${total}</p>
                        </div>

                        <p>Tus códigos de reserva son:</p>
                        <ul>
                            ${reservasCreadas.map(r => `<li>Asiento ${r.asientoNumero}: <strong>${r.codigoReserva}</strong></li>`).join('')}
                        </ul>

                        <p style="font-size: 0.9em; color: #666;">Presenta este correo al abordar.</p>
                    </div>
                `
            });
        } catch (mailError) {
            console.error("⚠️ Error enviando correo:", mailError);
        }

        // 5. Respuesta final (Si llega aquí, todo se guardó en la BD)
        return res.status(201).json({ 
            message: "Compra procesada correctamente", 
            reservas: reservasCreadas 
        });

    } catch (error: any) {
        // MANEJO DE ERRORES DE BASE DE DATOS/LÓGICA
        console.error("🚨 Error en compra (controller):", error);

        // Intento de identificar el error de la BD y devolverlo al usuario
        let errorMessage = "Error interno al procesar el pago.";
        if (error.message) {
            errorMessage = error.message;
        }

        if (errorMessage.includes("Seat") || errorMessage.includes("ocupado")) {
            return res.status(409).json({ message: "Asiento ya fue reservado. Por favor, vuelve a elegir." }); // 409 Conflict
        }
        
        // Devolvemos el mensaje de error de la base de datos (si no es de asiento)
        return res.status(500).json({ message: errorMessage });
    }
});

export { CompraRouter };