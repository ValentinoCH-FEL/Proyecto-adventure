import { Component, inject, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // Importante para la navegación
import { AutogestionService, ReservaDetalle } from '../../services/autogestion.service';

@Component({
  selector: 'app-autogestion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './autogestion.html',
  styleUrls: ['./autogestion.scss']
})
export class AutogestionComponent {
  // Inyección de dependencias
  private autogestionService = inject(AutogestionService);
  private cdr = inject(ChangeDetectorRef); // Para actualizar la vista manualmente si es necesario
  private router = inject(Router); // Para navegar al inicio

  // Formulario de búsqueda
  codigoBusqueda: string = '';
  emailBusqueda: string = '';

  // Estado del componente
  reservaEncontrada: ReservaDetalle | null = null;
  cargando: boolean = false;
  mensajeError: string = '';
  
  // Controla si se muestra el botón de cancelar
  puedeCancelar: boolean = false; 

  // --- MÉTODO PARA VOLVER AL INICIO ---
  volverInicio() {
    this.router.navigate(['/']);
  }

  // --- BUSCAR RESERVA ---
  buscarReserva() {
    // Reiniciamos estados
    this.reservaEncontrada = null;
    this.mensajeError = '';
    
    // Validación simple
    if (!this.codigoBusqueda || !this.emailBusqueda) {
      this.mensajeError = "Debes ingresar el código y el correo.";
      return;
    }

    this.cargando = true;

    // Llamada al servicio
    this.autogestionService.buscarReserva(this.codigoBusqueda, this.emailBusqueda)
      .subscribe({
        next: (data) => {
          this.cargando = false;
          this.reservaEncontrada = data; 
          
          // Solo permitimos cancelar si está CONFIRMADA
          if (data && data.estadoReserva === 'CONFIRMADA') {
             this.puedeCancelar = true;
          } else {
             // Si está CANCELADA, mostramos la info pero no dejamos cancelar de nuevo
             // Opcional: mostrar mensaje informativo
             if(data.estadoReserva !== 'CONFIRMADA') {
                this.puedeCancelar = false;
             }
          }
          
          // Forzamos la detección de cambios para asegurar que la UI se actualice
          this.cdr.detectChanges(); 
        },
        error: (err) => {
          this.cargando = false;
          
          // Manejo de errores específicos
          if (err.status === 404 || err.status === 400) {
             this.mensajeError = "Reserva no encontrada o datos de verificación incorrectos. Intenta de nuevo.";
          } else {
             this.mensajeError = "Error de conexión o servidor. Revisa la consola.";
             console.error("Error en la API de autogestión:", err);
          }
          
          this.reservaEncontrada = null;
          this.cdr.detectChanges(); 
        }
      });
  }

  // --- CANCELAR RESERVA ---
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
          
          // Actualizamos la vista localmente para reflejar el cambio sin recargar
          this.reservaEncontrada!.estadoReserva = 'CANCELADA'; 
          this.puedeCancelar = false;
          
          this.cdr.detectChanges(); 
        },
        error: (err) => {
          this.cargando = false;
          this.mensajeError = "No se pudo cancelar. Revisa la consola o intenta más tarde.";
          console.error(err);
          this.cdr.detectChanges();
        }
      });
  }

  // --- NUEVA BÚSQUEDA (LIMPIAR) ---
  nuevaBusqueda() {
    this.reservaEncontrada = null;
    this.codigoBusqueda = '';
    this.emailBusqueda = '';
    this.mensajeError = '';
    this.puedeCancelar = false;
  }
}