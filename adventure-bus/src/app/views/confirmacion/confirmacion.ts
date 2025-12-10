import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-confirmacion',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './confirmacion.html',
  styleUrls: ['./confirmacion.scss']
})
export class ConfirmacionComponent implements OnInit {
  private router = inject(Router);
  
  // Aquí guardaremos la respuesta real del backend (mensaje y array de reservas)
  datosCompra: any = null;

  constructor() {
    // 1. CAPTURAR DATOS DE NAVEGACIÓN
    // Esto debe hacerse en el constructor para leer el 'state' enviado por el router
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.datosCompra = navigation.extras.state['datosCompra'];
    }
  }

  ngOnInit() {
    // 2. FALLBACK: Si no se capturó en el constructor, intentar leer del historial
    if (!this.datosCompra) {
      this.datosCompra = history.state['datosCompra'];
    }

    console.log("Datos recibidos en Confirmación:", this.datosCompra);

    // 3. VALIDACIÓN DE SEGURIDAD
    // Si el usuario recarga la página (F5) o entra directo por URL, no habrá datos volátiles.
    // En ese caso, redirigimos al inicio para evitar errores.
    if (!this.datosCompra || !this.datosCompra.reservas) {
      console.warn("No hay datos de compra válidos. Redirigiendo...");
      // Damos un pequeño tiempo (3s) para que el usuario vea el loader (si lo hay) y entienda qué pasa
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 3000);
    }
  }

  // Acción para el botón de imprimir
  imprimirVoucher() {
    window.print();
  }

  volverAlInicio() {
    this.router.navigate(['/']);
  }
}