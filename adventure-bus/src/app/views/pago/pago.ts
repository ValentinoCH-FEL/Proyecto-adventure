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
  aceptarTerminos: boolean = false;

  // Estado de la tarjeta visual
  isCardFlipped: boolean = false;

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
    try {
      const data = localStorage.getItem('reserva_temporal');
      if (data) {
        this.reservaData = JSON.parse(data);
        // Validación básica
        if (!this.reservaData.total) {
           this.router.navigate(['/']);
        }
      } else {
        this.router.navigate(['/']);
      }
    } catch (e) {
      console.error("Error leyendo localStorage", e);
      this.router.navigate(['/']);
    }
  }

  // --- FORMATO VISUAL TARJETA ---
  formatCardNumber(event: any) {
    let input = event.target.value.replace(/\D/g, '').substring(0, 16);
    input = input.match(/.{1,4}/g)?.join(' ') || input;
    this.datosTarjeta.numero = input;
  }

  formatExpiry(event: any) {
    let input = event.target.value.replace(/\D/g, '').substring(0, 4);
    if (input.length >= 3) {
      input = input.substring(0, 2) + '/' + input.substring(2, 4);
    }
    this.datosTarjeta.vencimiento = input;
  }

  getCardType(): string {
    const num = this.datosTarjeta.numero.replace(/\s/g, '');
    if (/^4/.test(num)) return 'VISA';
    if (/^5[1-5]/.test(num)) return 'MASTERCARD';
    if (/^3[47]/.test(num)) return 'AMEX';
    return 'TARJETA';
  }

  procesarPago() {
    // Validaciones
    if (!this.reservaData) {
        alert("Error: Datos de sesión perdidos.");
        this.router.navigate(['/']);
        return;
    }

    if (!this.aceptarTerminos) {
        alert("Debes aceptar los Términos y Condiciones para continuar.");
        return;
    }

    if (this.metodoPago === 'TARJETA') {
        if (this.datosTarjeta.numero.length < 16 || !this.datosTarjeta.cvv || !this.datosTarjeta.vencimiento) {
            alert("Por favor completa los datos de tu tarjeta correctamente.");
            return;
        }
    }

    this.procesandoPago = true;

    // Construcción del objeto de compra
    const ordenCompra = {
        busId: this.reservaData.busId || this.reservaData.bus?.id,
        fechaViaje: this.reservaData.fechaViaje || this.reservaData.fecha,
        total: this.reservaData.total,
        metodoPago: this.metodoPago,
        pasajeros: this.reservaData.pasajeros, 
    };
    
    // Llamada al Backend
    this.compraService.procesarCompra(ordenCompra).subscribe({
      next: (respuesta) => {
        console.log("Compra Exitosa:", respuesta);
        
        localStorage.removeItem('reserva_temporal'); 
        
        // REDIRECCIÓN CON ESTADO
        this.router.navigate(['/confirmacion'], { 
          state: { 
            datosCompra: respuesta 
          } 
        });
      },
      error: (err) => {
        this.procesandoPago = false;
        console.error("Error en pago:", err);
        
        let msg = 'Error de conexión o servidor.';
        if (err.status === 409) {
           msg = "Lo sentimos, uno de los asientos seleccionados ya fue reservado por otra persona.";
        }
        
        alert(`❌ Error: ${msg}`);
      }
    });
  }
}