import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BusService, BusDTO } from '../../services/bus.service'; // Asegúrate que la ruta sea correcta

// Modelo visual solo para el frontend
interface AsientoVisual {
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

  // --- SIGNALS (ESTADO REACTIVO) ---
  bus = signal<BusDTO | null>(null);
  piso1 = signal<AsientoVisual[]>([]);
  piso2 = signal<AsientoVisual[]>([]);
  pisoActivo = signal<1 | 2>(1); // 1 o 2
  seleccionados = signal<AsientoVisual[]>([]);
  fechaViaje = signal<string>('');
  
  // Calcula el total automáticamente cuando cambian los seleccionados
  totalPagar = computed(() => {
    return this.seleccionados().reduce((acc, curr) => acc + curr.precio, 0);
  });

  ngOnInit() {
    // Leemos el ID del bus y la FECHA de la URL
    // Ejemplo: /seleccion-asiento/15?fecha=2024-12-25
    const idBus = this.route.snapshot.paramMap.get('id');
    const fecha = this.route.snapshot.queryParamMap.get('fecha');

    if (idBus && fecha) {
      this.fechaViaje.set(fecha);
      this.cargarDatosBus(Number(idBus));
    } else {
      // Si entra sin datos, lo devolvemos al inicio (opcional)
      console.error("Faltan parámetros");
    }
  }

  cargarDatosBus(id: number) {
    this.busService.obtenerBusPorId(id).subscribe({
      next: (data) => {
        this.bus.set(data);
        this.construirMapaBus(data);
      },
      error: (err) => console.error('Error al conectar con backend:', err)
    });
  }

  construirMapaBus(data: BusDTO) {
    const listaAsientos: AsientoVisual[] = [];
    const precioBase = Number(data.tarifaBase);
    const fechaBuscada = this.fechaViaje(); // '2024-12-25'

    // 1. Filtrar ocupados: Solo marcamos ocupado si coincide la fecha
    // Convertimos a string para asegurar comparación
    const ocupadosIds = data.asientosOcupados
      .filter(ocup => ocup.fechaViaje.toString().includes(fechaBuscada))
      .map(ocup => ocup.numeroAsiento.toString());

    // 2. Generar cajitas para cada asiento
    for (let i = 1; i <= data.capacidadTotal; i++) {
      const numStr = i.toString();
      
      // Lógica de pisos:
      // Si el bus tiene > 45 asientos, asientos 1-12 son Piso 1 (VIP)
      // Si el bus es pequeño (<= 45), es de un solo piso.
      let esPiso1 = (i <= 12 && data.capacidadTotal > 45) || data.capacidadTotal <= 45;
      
      // El piso 1 (VIP) suele costar más
      const precioFinal = (esPiso1 && data.capacidadTotal > 45) ? precioBase * 1.3 : precioBase;

      listaAsientos.push({
        numero: numStr,
        piso: esPiso1 && data.capacidadTotal > 45 ? 1 : 2, // Si es bus de 1 piso, lo mandamos al piso lógico 2 o 1 según prefieras
        estado: ocupadosIds.includes(numStr) ? 'ocupado' : 'libre',
        precio: precioFinal
      });
    }

    // Separamos en arrays para pintar fácil
    // Nota: Si es bus de 1 piso, todo irá a una lista y la otra vacía
    if (data.capacidadTotal <= 45) {
       this.piso1.set(listaAsientos); // Todo piso 1
       this.pisoActivo.set(1);
    } else {
       this.piso1.set(listaAsientos.filter(a => a.piso === 1));
       this.piso2.set(listaAsientos.filter(a => a.piso === 2));
       this.pisoActivo.set(2); // Usualmente se muestra primero el segundo piso en web
    }
  }

  toggleAsiento(asiento: AsientoVisual) {
    if (asiento.estado === 'ocupado') return;

    this.seleccionados.update(lista => {
      const yaExiste = lista.find(s => s.numero === asiento.numero);
      
      if (yaExiste) {
        // Deseleccionar
        asiento.estado = 'libre';
        return lista.filter(s => s.numero !== asiento.numero);
      } else {
        // Seleccionar (Validar máximo 5)
        if (lista.length >= 5) {
          alert("Máximo 5 pasajes por compra");
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

  irAPagar() {
    // Guardamos la info en localStorage para recuperarla en la vista de pago
    const resumenCompra = {
      bus: this.bus(),
      asientos: this.seleccionados(),
      total: this.totalPagar(),
      fecha: this.fechaViaje()
    };
    localStorage.setItem('reserva_temporal', JSON.stringify(resumenCompra));
    
    // Navegar a la ruta de pago
    this.router.navigate(['/pago']);
  }
}