import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BusService, BusDTO } from '../../services/bus.service';

export interface AsientoVisual {
  numero: string;
  piso: 1 | 2;
  estado: 'libre' | 'ocupado' | 'seleccionado';
  precio: number;
}

@Component({
  selector: 'app-seleccion-asiento',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seleccion-asiento.html',
  styleUrls: ['./seleccion-asiento.scss']
})
export class SeleccionAsientoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private busService = inject(BusService);

  // --- SIGNALS ---
  bus = signal<BusDTO | null>(null);
  piso1 = signal<AsientoVisual[]>([]);
  piso2 = signal<AsientoVisual[]>([]);
  pisoActivo = signal<1 | 2>(1);
  seleccionados = signal<AsientoVisual[]>([]);
  fechaViaje = signal<string>('');
  
  totalPagar = computed(() => {
    return this.seleccionados().reduce((acc, curr) => acc + curr.precio, 0);
  });

  ngOnInit() {
    const idBus = this.route.snapshot.paramMap.get('id');
    const fecha = this.route.snapshot.queryParamMap.get('fecha');

    if (idBus && fecha) {
      this.fechaViaje.set(fecha);
      this.cargarDatosBus(Number(idBus));
    } else {
      console.warn("Faltan parámetros");
      this.router.navigate(['/']);
    }
  }

  cargarDatosBus(id: number) {
    this.busService.obtenerBusPorId(id).subscribe({
      next: (data) => {
        if (data) {
          this.bus.set(data);
          this.construirMapaBus(data);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => console.error(err)
    });
  }

  construirMapaBus(data: BusDTO) {
    const listaAsientos: AsientoVisual[] = [];
    const precioBase = Number(data.tarifaBase);
    const fechaBuscada = this.fechaViaje();

    const ocupadosIds = (data.asientosOcupados || [])
      .filter(ocup => ocup.fechaViaje === fechaBuscada)
    .map(ocup => (ocup.asientoNumero || ocup.numeroAsiento || '').toString());
    const esDoblePiso = data.capacidadTotal > 60;

    for (let i = 1; i <= data.capacidadTotal; i++) {
      const numStr = i.toString();
      let pisoAsiento: 1 | 2 = 1;
      let precioAsiento = precioBase;

      if (esDoblePiso) {
        if (i <= 12) {
          pisoAsiento = 1;
          precioAsiento = precioBase * 1.4;
        } else {
          pisoAsiento = 2;
        }
      }

      listaAsientos.push({
        numero: numStr,
        piso: pisoAsiento,
        estado: ocupadosIds.includes(numStr) ? 'ocupado' : 'libre',
        precio: precioAsiento
      });
    }

    if (esDoblePiso) {
       this.piso1.set(listaAsientos.filter(a => a.piso === 1));
       this.piso2.set(listaAsientos.filter(a => a.piso === 2));
       this.pisoActivo.set(1);
    } else {
       this.piso1.set(listaAsientos);
       this.piso2.set([]);
       this.pisoActivo.set(1);
    }
  }

  toggleAsiento(asiento: AsientoVisual) {
    if (asiento.estado === 'ocupado') return;

    this.seleccionados.update(lista => {
      const yaExiste = lista.find(s => s.numero === asiento.numero);
      
      if (yaExiste) {
        asiento.estado = 'libre';
        return lista.filter(s => s.numero !== asiento.numero);
      } else {
        if (lista.length >= 5) {
          alert("Máximo 5 pasajes por compra.");
          return lista;
        }
        asiento.estado = 'seleccionado';
        return [...lista, asiento];
      }
    });
  }

  cambiarPiso(piso: 1 | 2) {
    this.pisoActivo.set(piso);
  }

  // --- CORRECCIÓN CRÍTICA AQUÍ ---
  irAPagar() {
    if (this.seleccionados().length === 0) return;

    // Restauramos la estructura EXACTA que tenía tu código original
    // para que las siguientes vistas (Registro/Pago) funcionen sin cambios.
    const resumenCompra = {
      bus: this.bus(), // Objeto completo del bus
      asientos: this.seleccionados(),
      total: this.totalPagar(),
      fecha: this.fechaViaje() // Clave 'fecha' en lugar de 'fechaViaje' si así lo usabas
    };

    try {
        localStorage.setItem('reserva_temporal', JSON.stringify(resumenCompra));
        this.router.navigate(['/registro-pasajero']);
    } catch (e) {
        console.error('Error al guardar localStorage', e);
    }
  }
}