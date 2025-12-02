import { Component, inject, ChangeDetectorRef } from '@angular/core'; // 1. Importamos ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutogestionService, ReservaDetalle } from '../../services/autogestion.service';

@Component({
  selector: 'app-autogestion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './autogestion.html',
  styleUrls: ['./autogestion.scss']
})
export class AutogestionComponent {
  private autogestionService = inject(AutogestionService);
  private cdr = inject(ChangeDetectorRef); // 2. Inyectamos el detector de cambios

  // Formulario de búsqueda
  codigoBusqueda: string = '';
  emailBusqueda: string = '';

  // Estado del componente
  reservaEncontrada: ReservaDetalle | null = null;
  cargando: boolean = false;
  mensajeError: string = '';
  
  // Para mostrar el botón de cancelar si es válida
  puedeCancelar: boolean = false; 

  buscarReserva() {
    this.reservaEncontrada = null;
    this.mensajeError = '';
    
    if (!this.codigoBusqueda || !this.emailBusqueda) {
      this.mensajeError = "Debes ingresar el código y el correo.";
      return;
    }

    this.cargando = true;

    // --- LLAMADA AL BACKEND ---
    this.autogestionService.buscarReserva(this.codigoBusqueda, this.emailBusqueda)
      .subscribe({
        next: (data) => {
          this.cargando = false;
          this.reservaEncontrada = data; // Guardamos la reserva encontrada
          
          if (data && data.estadoReserva === 'CONFIRMADA') {
             this.puedeCancelar = true;
          } else {
             this.mensajeError = `Esta reserva se encuentra en estado: ${data.estadoReserva}.`;
             this.reservaEncontrada = null;
          }
          this.cdr.detectChanges(); // <--- SOLUCIÓN: Forzar la actualización visual
        },
        error: (err) => {
          this.cargando = false;
          
          // Manejo del Error 404/400 (Reserva no encontrada)
          if (err.status === 404 || err.status === 400) {
             this.mensajeError = "Reserva no encontrada o datos de verificación incorrectos. Intenta de nuevo.";
          } else {
             this.mensajeError = "Error de conexión o servidor. Revisa la consola.";
             console.error("Error en la API de autogestión:", err);
          }
          this.reservaEncontrada = null;
          this.cdr.detectChanges(); // <--- SOLUCIÓN: Forzar actualización del mensaje de error
        }
      });
  }

  cancelarReserva() {
    if (!this.reservaEncontrada || !confirm("¿Estás seguro de que deseas cancelar esta reserva? Esta acción es irreversible.")) {
      return;
    }

    this.cargando = true;
    this.autogestionService.cancelarReserva(this.reservaEncontrada.id)
      .subscribe({
        next: (data) => {
          this.cargando = false;
          alert(`✅ Reserva ${data.reserva.codigoReserva} cancelada con éxito.`);
          
          // Actualizamos el estado local después de la cancelación
          this.reservaEncontrada!.estadoReserva = 'CANCELADA'; 
          this.puedeCancelar = false;
          this.cdr.detectChanges(); // Forzar actualización post-cancelación
        },
        error: (err) => {
          this.cargando = false;
          this.mensajeError = "No se pudo cancelar. Revisa la consola o intenta más tarde.";
          console.error(err);
          this.cdr.detectChanges();
        }
      });
  }

  // Permite al usuario limpiar la búsqueda y volver al formulario
  nuevaBusqueda() {
    this.reservaEncontrada = null;
    this.codigoBusqueda = '';
    this.emailBusqueda = '';
    this.mensajeError = '';
    this.puedeCancelar = false;
  }
}