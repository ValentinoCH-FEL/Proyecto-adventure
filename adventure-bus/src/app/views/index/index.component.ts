import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'; 
import { Router, RouterModule } from '@angular/router'; 
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common'; 
// IMPORTANTE: Importamos el servicio y el DTO para conectar con el backend
import { BusService, BusDTO } from '../../services/bus.service';

// 1. DEFINICIÓN DE INTERFACES
interface Busqueda {
  origen: string;
  destino: string;
  fecha: string; // Formato YYYY-MM-DD
}

interface DestinoDestacado {
  ruta: string;
  imagenUrl: string;
  id: number;
}

interface Servicio {
  descripcion: string;
  imagenUrl: string;
}

interface Slide {
  url: string;
  alt: string;
}

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
  standalone: true, 
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule 
  ] 
})
export class IndexComponent implements OnInit, OnDestroy {
  
  // Fecha mínima (hoy) para el input date
  public minDate: string = new Date().toISOString().substring(0, 10);

  busqueda: Busqueda = {
    origen: '',
    destino: '',
    fecha: this.minDate
  };
  
  errorBusqueda: string = '';

  // --- VARIABLES NUEVAS (Necesarias para el HTML) ---
  resultadosBusqueda: BusDTO[] = []; 
  buscando: boolean = false;
  mensajeSinResultados: string = '';

  // --- CARRUSEL ---
  slides: Slide[] = [
    { url: 'images/Promocion.jpg', alt: 'Promoción de verano' },
    { url: 'images/Cusco.jpg', alt: 'Viaja a la ciudad imperial del Cusco' },
    { url: 'images/Puno.jpg', alt: 'Descubre el Lago Titicaca en Puno' },
  ];
  
  currentSlide: number = 0;
  private intervalId: any = null; // 'any' para evitar conflictos de tipo entre Node/Browser

  // --- DATOS ---
  destinosDestacados: DestinoDestacado[] = [
    { ruta: 'Lima - Cusco', imagenUrl: 'images/Cusco.jpg', id: 1 }, 
    { ruta: 'Arequipa - Puno', imagenUrl: 'images/Puno.jpg', id: 2 },
    { ruta: 'Trujillo - Chiclayo', imagenUrl: 'images/chiclayo.jpg', id: 3 },
  ];

  servicios: Servicio[] = [
    { descripcion: 'Flota moderna y segura', imagenUrl: 'images/flota-adventure.png' },
    { descripcion: 'Viajes corporativos', imagenUrl: 'images/viaje-corporativo.png' },
    { descripcion: 'Compra online segura', imagenUrl: 'images/compra-online.jpg' },
    { descripcion: 'Atención 24/7', imagenUrl: 'images/atencion.jpg' },
  ];

  constructor(
    private router: Router,
    private busService: BusService, // Inyectamos el servicio
    private cdr: ChangeDetectorRef   // 2. Inyectamos el Detector de Cambios
  ) { }

  ngOnInit(): void {
    this.startAutoSlide();
  }
  
  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  // --- MÉTODOS DEL CARRUSEL ---
  startAutoSlide(): void {
    this.stopAutoSlide();
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopAutoSlide(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  prevSlide(): void {
    this.startAutoSlide(); 
    this.currentSlide = (this.currentSlide > 0) ? this.currentSlide - 1 : this.slides.length - 1;
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide < this.slides.length - 1) ? this.currentSlide + 1 : 0;
  }

  goToSlide(index: number): void {
    if (index >= 0 && index < this.slides.length) {
      this.currentSlide = index;
      this.startAutoSlide(); 
    }
  }

  // --- LÓGICA DE BÚSQUEDA ---
  
  buscarViaje(): void {
    this.errorBusqueda = '';
    this.mensajeSinResultados = '';
    this.resultadosBusqueda = []; // Limpiamos resultados anteriores

    // Validaciones básicas
    if (!this.busqueda.origen || !this.busqueda.destino) {
      this.errorBusqueda = 'Por favor, ingrese origen y destino.';
      return;
    }
    
    if (this.busqueda.origen.trim().toLowerCase() === this.busqueda.destino.trim().toLowerCase()) {
        this.errorBusqueda = 'El origen y destino no pueden ser iguales.';
        return;
    }

    const fechaSeleccionada = new Date(this.busqueda.fecha);
    const hoy = new Date(this.minDate);
    
    if (fechaSeleccionada < hoy) {
      this.errorBusqueda = 'La fecha no puede ser anterior a hoy.';
      return;
    }
    
    console.log('Buscando viaje:', this.busqueda);

    // --- LLAMADA A LA API (REAL) ---
    this.buscando = true;
    
    this.busService.buscarViajes(this.busqueda.origen, this.busqueda.destino, this.busqueda.fecha)
      .subscribe({
        next: (buses) => {
          this.buscando = false;
          if (buses.length > 0) {
            this.resultadosBusqueda = buses; // Mostramos la lista de resultados
          } else {
            this.mensajeSinResultados = `No se encontraron viajes de ${this.busqueda.origen} a ${this.busqueda.destino} para esta fecha.`;
          }
          // 3. ¡DESPIERTA ANGULAR! FORZAMOS LA ACTUALIZACIÓN VISUAL
          this.cdr.detectChanges(); 
        },
        error: (err) => {
          this.buscando = false;
          console.error("Error buscando viajes:", err);
          this.errorBusqueda = 'Ocurrió un error al conectar con el servidor.';
          // 3. Forzamos actualización también en caso de error
          this.cdr.detectChanges();
        }
      });
  }

  // --- NUEVO MÉTODO PARA EL BOTÓN DE RESULTADOS ---
  seleccionarViaje(idBus: number): void {
    this.router.navigate(['/seleccion-asiento', idBus], {
      queryParams: { fecha: this.busqueda.fecha }
    });
  }

  comprarDestacado(destino: DestinoDestacado): void {
    console.log('Comprando destacado:', destino.ruta);
    // Usamos el ID real del destino y la fecha seleccionada
    this.router.navigate(['/seleccion-asiento', destino.id], {
       queryParams: { fecha: this.busqueda.fecha }
    });
  }

  // --- UTILIDADES FECHA ---
  seleccionarHoy(): void {
    this.busqueda.fecha = this.minDate;
    this.errorBusqueda = '';
  }

  seleccionarManana(): void {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    this.busqueda.fecha = manana.toISOString().substring(0, 10);
    this.errorBusqueda = '';
  }

  cambiarIdioma(event: Event): void {
    console.log('Idioma cambiado');
  }
}