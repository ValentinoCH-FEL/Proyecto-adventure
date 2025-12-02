import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CompraService } from '../../services/compra.service'; 

@Component({
  selector: 'app-pago',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pago.html',
  styleUrls: ['./pago.scss']
})
export class PagoComponent implements OnInit {
  private router = inject(Router);
  private compraService = inject(CompraService);

  reservaData: any = null;
  procesandoPago: boolean = false;
  metodoPago: string = 'TARJETA';

  datosTarjeta = {
    numero: '', 
    nombre: '', 
    vencimiento: '', 
    cvv: ''
  };

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    const data = localStorage.getItem('reserva_temporal');
    if (data) {
      this.reservaData = JSON.parse(data);
    } else {
      this.router.navigate(['/']);
    }
  }

  procesarPago() {
    
    // Si no hay datos de reserva, fallamos antes de llamar a la API
    if (!this.reservaData) {
        alert("Error: No se encontraron datos de la reserva. Vuelve al inicio.");
        this.router.navigate(['/']);
        return;
    }

    // 1. Validaciones básicas de formulario (si eligió tarjeta)
    if (this.metodoPago === 'TARJETA') {
        if (!this.datosTarjeta.numero || !this.datosTarjeta.cvv) {
            alert("Por favor ingresa los datos de tu tarjeta.");
            return;
        }
    }

    this.procesandoPago = true;

    // 2. Estructura de la orden que se envía al Backend
    const ordenCompra = {
        busId: this.reservaData.bus.id,
        fechaViaje: this.reservaData.fecha,
        total: this.reservaData.total,
        metodoPago: this.metodoPago,
        // Lo más importante: Enviamos la lista de pasajeros completa
        pasajeros: this.reservaData.pasajeros, 
    };
    
    // 3. LLAMADA REAL AL BACKEND
    this.compraService.procesarCompra(ordenCompra).subscribe({
      next: (respuesta) => {
        console.log("DIAGNÓSTICO: Backend respondió con éxito:", respuesta); // Mensaje de éxito

        // Éxito: Redirigir a la pantalla de confirmación
        this.router.navigate(['/confirmacion']); 
      },
      error: (err) => {
        this.procesandoPago = false;
        
        // --- LOG DE FALLO DE CONEXIÓN ---
        console.error("DIAGNÓSTICO: Fallo en la solicitud HTTP:", err);
        
        let msg = 'Error de conexión o servidor.';
        if (err.status === 409) msg = "Asiento ya fue reservado. Vuelve a selección.";
        
        alert(`❌ Error en la Transacción: ${msg}. Revisa la consola F12 (Network) y la terminal de Node.js.`);
      }
    });
  }
}