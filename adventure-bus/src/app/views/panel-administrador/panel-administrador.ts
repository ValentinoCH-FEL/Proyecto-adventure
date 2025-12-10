import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BusService, BusDTO } from '../../services/bus.service';

@Component({
  selector: 'app-panel-administrador',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './panel-administrador.html',
  styleUrls: ['./panel-administrador.scss'] // Asegúrate que el nombre coincida
})
export class PanelAdministradorComponent implements OnInit {
  
  // INYECCIÓN DE DEPENDENCIAS
  private authService = inject(AuthService);
  private router = inject(Router);
  private busService = inject(BusService);
  private cdr = inject(ChangeDetectorRef); // Vital para actualizar la vista

  // DATOS
  buses: BusDTO[] = [];
  tiposServicio = ['Clásico', 'Vip', 'Premium'];
  
  busActual: BusDTO = this.inicializarBus();
  
  // ESTADOS DE LA VISTA
  esModoEdicion: boolean = false;
  cargando: boolean = false;
  error: string = '';

  ngOnInit() {
    this.cargarBuses();
  }

  // Objeto base para resetear el formulario
  inicializarBus(): BusDTO {
    return {
      id: 0,
      placa: '',
      modelo: '',
      capacidadTotal: 40,
      rutaOrigen: 'Lima',
      rutaDestino: 'Cusco',
      horaSalida: '08:00',
      tarifaBase: 50.00,
      tipoServicio: 'Clásico',
      estadoActivo: true,
      asientosOcupados: []
    };
  }

  cargarBuses() {
    this.cargando = true;
    this.busService.findAllBuses().subscribe({
      next: (data) => {
        this.buses = data;
        this.cargando = false;
        this.cdr.detectChanges(); // Forzamos actualización visual
      },
      error: (err) => {
        console.error("Error cargando buses:", err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  iniciarEdicion(bus: BusDTO) {
    this.esModoEdicion = true;
    this.busActual = { ...bus }; // Clonamos para no editar la tabla directamente
    
    // Scroll suave hacia el formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicion() {
    this.esModoEdicion = false;
    this.busActual = this.inicializarBus();
    this.error = '';
  }

  guardarBus() {
    this.cargando = true;
    this.error = '';

    // Decidimos si es CREAR o ACTUALIZAR
    const peticion$ = this.esModoEdicion 
      ? this.busService.updateBus(this.busActual.id, this.busActual)
      : this.busService.guardarBus(this.busActual); 

    peticion$.subscribe({
      next: () => {
        // Éxito
        this.cargarBuses(); // Recargamos la lista
        this.cancelarEdicion(); // Reseteamos form
        this.cargando = false;
        
        // Opcional: Podrías usar un Toast aquí en lugar de alert
        alert(this.esModoEdicion ? '✅ Bus actualizado correctamente' : '✅ Nuevo bus registrado');
        
        this.cdr.detectChanges();
      },
      error: (err: any) => { 
        console.error("Error guardando:", err);
        this.error = "No se pudo guardar. Verifique que la placa no esté duplicada.";
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  eliminarBus(id: number) {
    if (!confirm('¿Está seguro de eliminar este bus? Esta acción no se puede deshacer.')) return;
    
    // Optimismo UI: Lo quitamos visualmente primero para que se sienta rápido
    const respaldoBuses = [...this.buses];
    this.buses = this.buses.filter(b => b.id !== id);
    
    this.busService.eliminarBus(id).subscribe({
      next: () => {
        // Confirmado en backend, todo bien
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        // Si falla, revertimos el cambio visual
        this.buses = respaldoBuses;
        alert('❌ No se puede eliminar: El bus tiene viajes o ventas asociadas.');
        this.cdr.detectChanges();
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/admin-login']);
  }
}