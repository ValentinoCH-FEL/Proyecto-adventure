import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router'; 
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common'; 

// 1. DEFINICIÓN DE INTERFACES PARA MEJORAR LA TIPIFICACIÓN DE DATOS
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
  // Componente Standalone: Importaciones necesarias para plantillas
  standalone: true, 
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule 
  ] 
})

export class IndexComponent implements OnInit, OnDestroy {
  
  // Propiedad para obtener la fecha mínima (hoy) y usarla en el input[type=date] del HTML
  public minDate: string = new Date().toISOString().substring(0, 10);

  // Propiedad para enlazar con el formulario de búsqueda, tipada con la interfaz Busqueda
  busqueda: Busqueda = {
    origen: '',
    destino: '',
    fecha: this.minDate // Valor inicial: hoy
  };
  
  // Mensaje de error para el formulario de búsqueda
  errorBusqueda: string = '';

  // --- LÓGICA DEL CARRUSEL ---
  slides: Slide[] = [
    // Nota: Las imágenes deben estar en la carpeta 'assets' o ser URLs absolutas.
    { url: 'images/Promocion.jpg', alt: 'Promoción de verano' },
    { url: 'images/Cusco.jpg', alt: 'Viaja a la ciudad imperial del Cusco' },
    { url: 'images/Puno.jpg', alt: 'Descubre el Lago Titicaca en Puno' },
  ];
  
  currentSlide: number = 0; // Índice del slide actual (0-based)
  private intervalId: ReturnType<typeof setInterval> | null = null; // ID para el intervalo de auto-slide

  // --- DATOS DE EJEMPLO ---
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
    // private busService: BusService // Inyecta tu servicio aquí
  ) { }

  ngOnInit(): void {
    // Lógica de inicialización
    this.startAutoSlide();
  }
  
  // Limpia el intervalo de auto-slide cuando el componente es destruido
  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  // --- MÉTODOS DEL CARRUSEL ---

  startAutoSlide(): void {
    this.stopAutoSlide(); // Detiene cualquier intervalo existente
    // Usamos window.setInterval para asegurar el tipo correcto si no se usa Node.js
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 5000); // Auto-slide cada 5 segundos
  }

  stopAutoSlide(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Navega al slide anterior
  prevSlide(): void {
    // Reinicia el auto-slide después de la interacción manual
    this.startAutoSlide(); 
    this.currentSlide = (this.currentSlide > 0) ? this.currentSlide - 1 : this.slides.length - 1;
  }

  // Navega al slide siguiente
  nextSlide(): void {
    this.currentSlide = (this.currentSlide < this.slides.length - 1) ? this.currentSlide + 1 : 0;
  }

  // Navega a un slide específico (usado por los indicadores)
  goToSlide(index: number): void {
    if (index >= 0 && index < this.slides.length) {
      this.currentSlide = index;
      // Reinicia el auto-slide después de la interacción manual
      this.startAutoSlide(); 
    }
  }

  // --- MÉTODOS DEL HEADER Y BUSCADOR ---
  
  cambiarIdioma(event: Event): void {
    const target = event.target as HTMLSelectElement;
    console.log('Cambiando idioma a:', target.value);
    // Lógica para cambiar el idioma de la aplicación (i18n)
  }

  /**
   * Válida que los campos de Origen, Destino y Fecha sean válidos antes de navegar.
   * También asegura que la fecha no sea pasada.
   */
  buscarViaje(): void {
    this.errorBusqueda = ''; // Limpiar errores anteriores

    if (!this.busqueda.origen || !this.busqueda.destino) {
      this.errorBusqueda = 'Por favor, ingrese el origen y el destino del viaje.';
      return;
    }
    
    if (this.busqueda.origen.trim().toLowerCase() === this.busqueda.destino.trim().toLowerCase()) {
        this.errorBusqueda = 'El origen y el destino no pueden ser el mismo.';
        return;
    }

    // Validación de fecha: Asegura que la fecha seleccionada no es anterior a hoy
    const fechaSeleccionada = new Date(this.busqueda.fecha);
    const hoy = new Date(this.minDate); // Usamos minDate para consistencia
    
    // Compara solo las fechas, ignorando la hora
    if (fechaSeleccionada < hoy) {
      this.errorBusqueda = 'La fecha de viaje no puede ser anterior al día de hoy.';
      return;
    }
    
    // Si todo es válido, procede con la búsqueda
    console.log('Buscando viaje:', this.busqueda);
    // Aquí se ejecutaría la lógica de llamada a la API y manejo de resultados.
    
    // Navegación directa para pruebas
    this.router.navigate(['/seleccion-asiento']); 
  }

  seleccionarHoy(): void {
    this.busqueda.fecha = this.minDate; // Asigna la fecha de hoy
    this.errorBusqueda = '';
  }

  seleccionarManana(): void {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    this.busqueda.fecha = manana.toISOString().substring(0, 10);
    this.errorBusqueda = '';
  }
  
  // Función que se dispara cuando cambia el input de fecha. Ayuda con la validación.
  onFechaChange(): void {
    // Si la fecha es cambiada manualmente a un valor menor al mínimo, la corrige.
    if (this.busqueda.fecha < this.minDate) {
        // En un caso real, podríamos resetear a minDate o simplemente mostrar el error.
        // Aquí lo dejamos para que el mensaje de error de buscarViaje() lo capture, 
        // pero el HTML ya limita la selección. Esto es solo una medida de seguridad.
        console.warn("Se seleccionó una fecha anterior a hoy.");
    }
    this.errorBusqueda = '';
  }
  
  // --- MÉTODOS DE DESTACADOS ---

  comprarDestacado(destino: DestinoDestacado): void {
    console.log('Iniciando compra para:', destino.ruta);
    this.errorBusqueda = ''; // Limpiamos errores antes de proceder
    
    // Rellena el origen y destino de la búsqueda con la ruta destacada
    const partes = destino.ruta.split(' - '); 
    if (partes.length === 2) {
      this.busqueda.origen = partes[0].trim();
      this.busqueda.destino = partes[1].trim();
      
      // La fecha se mantiene en hoy/futuro según lo que esté configurado
      
      // Navega a la página de selección de asiento/viaje
      this.router.navigate(['/seleccion-asiento']);
    } else {
        console.error('Formato de ruta destacada inválido:', destino.ruta);
    }
  }
}