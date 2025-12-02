import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-confirmacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmacion.html',
  styleUrls: ['./confirmacion.scss']
})
export class ConfirmacionComponent implements OnInit {
  private router = inject(Router);

  codigoReserva: string = '';
  datosViaje: any = null;
  qrUrl: string = '';
  emailUsuario: string = '';

  ngOnInit() {
    // 1. Generar código de reserva único (Simulación: ADV-XXXXXX)
    this.codigoReserva = 'ADV-' + Math.floor(100000 + Math.random() * 900000);

    // 2. Recuperar datos del viaje (desde localStorage o estado)
    // Nota: En un flujo real, estos datos vendrían de la respuesta del Backend al pagar.
    const data = localStorage.getItem('reserva_temporal');
    
    if (data) {
      this.datosViaje = JSON.parse(data);
      
      // Tomamos el correo del primer pasajero para mostrar dónde se envió
      if (this.datosViaje.pasajeros && this.datosViaje.pasajeros.length > 0) {
        this.emailUsuario = this.datosViaje.pasajeros[0].correoElectronico;
      }

      // 3. Generar QR Real con la API de qrserver
      // El QR contiene el código de reserva para escanear en la terminal
      this.qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${this.codigoReserva}`;
      
      // Opcional: Limpiar la reserva temporal para que no se pueda volver atrás
      // localStorage.removeItem('reserva_temporal'); 
    } else {
      // Si no hay datos, volvemos al inicio
      this.router.navigate(['/']);
    }
  }

  volverAlInicio() {
    localStorage.removeItem('reserva_temporal'); // Limpieza final
    this.router.navigate(['/']);
  }
}