import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core'; // <--- IMPORTANTE
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
  styleUrls: ['./panel-administrador.scss']
})
export class PanelAdministradorComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private busService = inject(BusService);
  
  // 🛠️ SOLUCIÓN: Inyectamos el detector de cambios
  private cd = inject(ChangeDetectorRef); 

  buses: BusDTO[] = [];
  tiposServicio = ['Clásico', 'Vip', 'Premium'];
  
  // Inicialización correcta para evitar errores de null
  busActual: BusDTO = this.inicializarBus();
  esModoEdicion: boolean = false;
  cargando: boolean = false;
  error: string = '';

  ngOnInit() {
    this.cargarBuses();
  }

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
        this.cd.detectChanges(); // <--- ¡FUERZA LA ACTUALIZACIÓN VISUAL!
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
      }
    });
  }

  iniciarEdicion(bus: BusDTO) {
    this.esModoEdicion = true;
    this.busActual = { ...bus }; // Clonamos
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicion() {
    this.esModoEdicion = false;
    this.busActual = this.inicializarBus();
  }

  guardarBus() {
    this.cargando = true;
    this.error = '';

    const peticion$ = this.esModoEdicion 
      ? this.busService.updateBus(this.busActual.id, this.busActual)
      : this.busService.guardarBus(this.busActual); 

    peticion$.subscribe({
      next: () => {
        alert(this.esModoEdicion ? '✅ Bus actualizado' : '✅ Nuevo bus creado');
        this.cargarBuses(); 
        this.cancelarEdicion();
        this.cd.detectChanges(); // <--- ¡FUERZA LA ACTUALIZACIÓN!
      },
      error: (err: any) => { 
        console.error(err);
        this.error = "Error al guardar los datos.";
        this.cargando = false;
        this.cd.detectChanges(); // <--- Incluso en error, actualizamos la vista
      }
    });
  }

  eliminarBus(id: number) {
    if (!confirm('¿Seguro que deseas eliminar este bus permanentemente?')) return;
    
    this.busService.eliminarBus(id).subscribe({
      next: () => {
        // Optimismo UI: Lo quitamos de la lista visualmente primero
        this.buses = this.buses.filter(b => b.id !== id);
        this.cd.detectChanges(); // <--- Actualizamos vista inmediatamente
        alert('🗑️ Bus eliminado correctamente');
      },
      error: (err: any) => {
        console.error(err);
        alert('Error al eliminar. Puede que tenga ventas asociadas.');
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/admin-login']);
  }
}