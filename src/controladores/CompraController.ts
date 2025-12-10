import { Request, Response, Router } from "express";
import { ReservaService } from "../servicios/ReservaService";
import nodemailer from "nodemailer";

const CompraRouter = Router();

// --- CONFIGURACIÓN GMAIL ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'Calderonhurtadovalentino@gmail.com',
        pass: 'kohozxovxclzlmuh'
    }
});

/**
 * POST /api/compra
 * Recibe la lista de pasajeros y genera las reservas.
 */
CompraRouter.post('/', async (req: Request, res: Response) => {
    
    const { busId, fechaViaje: fechaViajeStr, pasajeros, total, metodoPago } = req.body;
    const reservasCreadas = [];
    
    // CORRECCIÓN DE ZONA HORARIA:
    // Agregamos 'T12:00:00' para fijar la hora al mediodía. 
    // Esto evita que al restar horas por la zona horaria (ej: Perú -5h), la fecha retroceda al día anterior.
    const fechaViajeObjeto = new Date(fechaViajeStr + 'T12:00:00');

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
            
            // Misma corrección para fecha de nacimiento (opcional, pero recomendada)
            const fechaNacimientoObjeto = new Date(p.fechaNacimiento + 'T12:00:00');

            const reservaData = {
                busId: busId,
                fechaViaje: fechaViajeObjeto,
                asientoNumero: p.asientoNumero,
                precioPagado: p.precio,
                pasajeroData: {
                    tipoDocumento: p.tipoDocumento,
                    numeroDocumento: p.numeroDocumento,
                    nombres: p.nombres,
                    apellidoPaterno: p.apellidoPaterno,
                    apellidoMaterno: p.apellidoMaterno,
                    correoElectronico: p.correoElectronico,
                    fechaNacimiento: fechaNacimientoObjeto,
                    nacionalidad: p.nacionalidad,
                    genero: p.genero,
                }
            };
            
            // Llamamos al servicio (Aquí es donde puede saltar el error de asiento ocupado)
            const nuevaReserva = await ReservaService.createNewReserva(reservaData);
            reservasCreadas.push(nuevaReserva);
        }
        
        // 4. Enviar el correo AL TITULAR
        try {
            console.log(`Enviando correo a: ${correoTitular}`);
            
            // Verificamos que se haya creado al menos una reserva para obtener datos del bus
            if (reservasCreadas.length > 0) {
                const rutaOrigen = reservasCreadas[0].bus.rutaOrigen;
                const rutaDestino = reservasCreadas[0].bus.rutaDestino;

                await transporter.sendMail({
                    from: '"Adventure Bus 🚌" <Calderonhurtadovalentino@gmail.com>',
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
                                ${reservasCreadas.map((r: any) => `<li>Asiento ${r.asientoNumero}: <strong>${r.codigoReserva}</strong></li>`).join('')}
                            </ul>

                            <p style="font-size: 0.9em; color: #666;">Presenta este correo al abordar.</p>
                        </div>
                    `
                });
            }
        } catch (mailError) {
            console.error("⚠️ Error enviando correo:", mailError);
            // No detenemos el flujo si falla el correo, ya que la reserva se hizo
        }

        // 5. Respuesta final
        return res.status(201).json({ 
            message: "Compra procesada correctamente", 
            reservas: reservasCreadas 
        });

    } catch (error: any) {
        // --- AQUÍ ESTÁ LA PROTECCIÓN CONTRA EL ERROR 500 ---
        console.error("🚨 Error en compra (controller):", error);

        // Detección específica del error de MySQL para "Duplicate entry" (Asiento ocupado)
        if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
            return res.status(409).json({ 
                message: "Lo sentimos, uno de los asientos seleccionados ya fue reservado por otra persona. Por favor, elige otro.",
                error: "ASIENTO_OCUPADO"
            });
        }

        let errorMessage = "Error interno al procesar el pago.";
        if (error.message) {
            errorMessage = error.message;
        }

        // Devolvemos el mensaje de error genérico si no fue un asiento duplicado
        return res.status(500).json({ message: errorMessage });
    }
});

export { CompraRouter };