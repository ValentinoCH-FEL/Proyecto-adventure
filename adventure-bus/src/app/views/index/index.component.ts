import { Component, OnInit, OnDestroy, ChangeDetectorRef, Inject, Renderer2, ViewChild, ElementRef } from '@angular/core'; 
import { Router, RouterModule } from '@angular/router'; 
import { FormsModule } from '@angular/forms'; 
import { CommonModule, DOCUMENT } from '@angular/common'; 
import { BusService, BusDTO } from '../../services/bus.service';

// --- INTERFACES ---
interface Busqueda {
  origen: string;
  destino: string;
  fecha: string;
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
  
  // Referencia directa al input de fecha para no usar querySelector (Más seguro/Angular)
  @ViewChild('fechaInput') fechaInputRef!: ElementRef<HTMLInputElement>;

  // --- CONFIGURACIÓN FECHAS ---
  public minDate: string = new Date().toISOString().substring(0, 10);

  // --- MODELO DE BÚSQUEDA ---
  busqueda: Busqueda = {
    origen: '',
    destino: '',
    fecha: this.minDate
  };
  
  errorBusqueda: string = '';
  resultadosBusqueda: BusDTO[] = []; 
  buscando: boolean = false;
  mensajeSinResultados: string = '';

  // Variable para controlar la animación de rotación del botón swap
  isRotated: boolean = false;

  // --- VARIABLES PARA EL MODAL DE CONTACTO ---
  showContactModal: boolean = false;

  // --- VARIABLES PARA AUTOCOMPLETADO ---
  ciudadesDisponibles: string[] = [
    'Lima', 'Arequipa', 'Trujillo', 'Chiclayo', 'Piura', 'Iquitos', 'Cusco', 
    'Chimbote', 'Huancayo', 'Tacna', 'Ica', 'Juliaca', 'Pucallpa', 'Sullana', 
    'Ayacucho', 'Chincha', 'Huánuco', 'Cajamarca', 'Tarapoto', 'Puno', 'Tumbes'
  ];

  sugerenciasOrigen: string[] = [];
  sugerenciasDestino: string[] = [];
  mostrarSugerenciasOrigen: boolean = false;
  mostrarSugerenciasDestino: boolean = false;

  // --- CARRUSEL ---
  slides: Slide[] = [
    { url: 'images/Promocion.jpg', alt: 'Viaja seguro este verano' },
    { url: 'images/Cusco.jpg', alt: 'Visita la ciudad imperial del Cusco' },
    { url: 'images/Puno.jpg', alt: 'Conoce el Lago Titicaca' },
  ];
  
  currentSlide: number = 0;
  // CORRECCIÓN: Tipo estricto para el timer
  private intervalId: ReturnType<typeof setInterval> | null = null;

  // --- DATOS INFORMATIVOS (MOCK) ---
  destinosDestacados: DestinoDestacado[] = [
    { ruta: 'Lima - Cusco', imagenUrl: 'images/Cusco.jpg', id: 1 }, 
    { ruta: 'Arequipa - Puno', imagenUrl: 'images/Puno.jpg', id: 2 },
    { ruta: 'Trujillo - Chiclayo', imagenUrl: 'images/chiclayo.jpg', id: 3 },
  ];

  servicios: Servicio[] = [
    { descripcion: 'Flota Moderna', imagenUrl: 'images/flota-adventure.png' },
    { descripcion: 'Seguridad GPS', imagenUrl: 'images/atencion.jpg' },
    { descripcion: 'Compra Segura', imagenUrl: 'images/compra-online.jpg' },
  ];

  constructor(
    private router: Router,
    private busService: BusService,
    private cdr: ChangeDetectorRef,
    // Inyección segura del Documento y Renderer
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    this.startAutoSlide();
  }
  
  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  // ==========================================
  // LÓGICA DE AUTOCOMPLETADO
  // ==========================================

  onInputBusqueda(tipo: 'origen' | 'destino'): void {
    const texto = tipo === 'origen' ? this.busqueda.origen : this.busqueda.destino;
    
    if (!texto) {
      if (tipo === 'origen') this.sugerenciasOrigen = [];
      else this.sugerenciasDestino = [];
      return;
    }

    const textoNormalizado = this.normalizeText(texto);

    const resultados = this.ciudadesDisponibles.filter(ciudad => 
      this.normalizeText(ciudad).includes(textoNormalizado)
    );

    if (tipo === 'origen') {
      this.sugerenciasOrigen = resultados;
      this.mostrarSugerenciasOrigen = true;
    } else {
      this.sugerenciasDestino = resultados;
      this.mostrarSugerenciasDestino = true;
    }
  }

  seleccionarSugerencia(tipo: 'origen' | 'destino', ciudad: string): void {
    if (tipo === 'origen') {
      this.busqueda.origen = ciudad;
      this.mostrarSugerenciasOrigen = false;
    } else {
      this.busqueda.destino = ciudad;
      this.mostrarSugerenciasDestino = false;
    }
  }

  ocultarSugerencias(tipo: 'origen' | 'destino'): void {
    setTimeout(() => {
      if (tipo === 'origen') this.mostrarSugerenciasOrigen = false;
      else this.mostrarSugerenciasDestino = false;
    }, 200);
  }

  private normalizeText(text: string): string {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  // ==========================================
  // LÓGICA: INTERCAMBIAR RUTAS
  // ==========================================
  intercambiarRuta(): void {
    const temp = this.busqueda.origen;
    this.busqueda.origen = this.busqueda.destino;
    this.busqueda.destino = temp;
    this.isRotated = !this.isRotated; 
  }

  // ==========================================
  // LÓGICA DEL MODAL DE CONTACTO
  // ==========================================
  openContactModal(): void {
    this.showContactModal = true;
    this.renderer.setStyle(this.document.body, 'overflow', 'hidden');
  }

  closeContactModal(): void {
    this.showContactModal = false;
    this.renderer.setStyle(this.document.body, 'overflow', 'auto');
  }

  // ==========================================
  // LÓGICA DE BÚSQUEDA
  // ==========================================
  buscarViaje(): void {
    this.errorBusqueda = '';
    this.mensajeSinResultados = '';
    this.resultadosBusqueda = [];

    if (!this.busqueda.origen || !this.busqueda.destino) {
      this.errorBusqueda = 'Por favor, completa origen y destino.';
      return;
    }
    
    if (this.normalizeText(this.busqueda.origen) === this.normalizeText(this.busqueda.destino)) {
        this.errorBusqueda = 'El origen y destino deben ser diferentes.';
        return;
    }

    const fechaSeleccionada = new Date(this.busqueda.fecha);
    const hoy = new Date(this.minDate);
    
    // Comparar solo fechas (Y-M-D) para evitar problemas de horas
    if (fechaSeleccionada.toISOString().split('T')[0] < hoy.toISOString().split('T')[0]) {
      this.errorBusqueda = 'La fecha no puede ser pasada.';
      return;
    }
    
    this.buscando = true;
    
    this.busService.buscarViajes(this.busqueda.origen, this.busqueda.destino, this.busqueda.fecha)
      .subscribe({
        next: (buses) => {
          setTimeout(() => {
            this.buscando = false;
            
            if (buses.length > 0) {
              this.resultadosBusqueda = buses;
              setTimeout(() => {
                // Usamos document aquí porque el scroll es global o a un ID
                const element = this.document.getElementById('resultados');
                if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 100);
            } else {
              this.mensajeSinResultados = `No hay salidas programadas de ${this.busqueda.origen} a ${this.busqueda.destino} para esta fecha.`;
            }
            this.cdr.detectChanges();
          }, 600);
        },
        error: (err) => {
          this.buscando = false;
          console.error('Error al buscar viajes'); 
          this.errorBusqueda = 'Error de conexión. Intente nuevamente.';
          this.cdr.detectChanges();
        }
      });
  }

  seleccionarViaje(idBus: number): void {
    this.router.navigate(['/seleccion-asiento', idBus], {
      queryParams: { fecha: this.busqueda.fecha }
    });
  }

  // Lógica UX Pro para "Comprar" desde destacados
  comprarDestacado(destino: DestinoDestacado): void {
    const partes = destino.ruta.split(' - ');
    
    if (partes.length === 2) {
      this.busqueda.origen = partes[0].trim();
      this.busqueda.destino = partes[1].trim();
      
      if (!this.busqueda.fecha) {
        this.busqueda.fecha = this.minDate;
      }

      // Scroll suave hacia arriba
      if (this.document.defaultView) {
        this.document.defaultView.scrollTo({ top: 0, behavior: 'smooth' });
      }

      // Enfocar fecha usando ViewChild (Forma segura Angular)
      setTimeout(() => {
        if (this.fechaInputRef && this.fechaInputRef.nativeElement) {
          const nativeInput = this.fechaInputRef.nativeElement;
          nativeInput.focus();
          
          // Intentar abrir el calendario nativo
          if (typeof nativeInput.showPicker === 'function') {
            try {
              nativeInput.showPicker();
            } catch (e) { 
              // Fallback silencioso
            }
          }
        }
      }, 500);
    }
  }

  // ==========================================
  // UTILIDADES FECHA & CARRUSEL
  // ==========================================
  seleccionarHoy(): void {
    this.busqueda.fecha = this.minDate;
    this.errorBusqueda = '';
  }

  // SELECCIONAR SIGUIENTE DÍA + BUSCAR
  seleccionarManana(): void {
    const fechaBase = this.busqueda.fecha 
      ? new Date(this.busqueda.fecha + 'T12:00:00') 
      : new Date();

    fechaBase.setDate(fechaBase.getDate() + 1);

    this.busqueda.fecha = fechaBase.toISOString().substring(0, 10);
    this.errorBusqueda = '';

    // Ejecuta la búsqueda automáticamente
    this.buscarViaje();
  }

  startAutoSlide(): void {
    this.stopAutoSlide();
    this.intervalId = setInterval(() => { this.nextSlide(); }, 5000);
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
    this.startAutoSlide();
    this.currentSlide = (this.currentSlide < this.slides.length - 1) ? this.currentSlide + 1 : 0;
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
    this.startAutoSlide(); 
  }
}