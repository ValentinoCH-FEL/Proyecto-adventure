// src/app/views/index/index.component.ts

import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router'; // Asegúrate de tener RouterModule para routerLink
import { FormsModule } from '@angular/forms'; // <-- ¡IMPORTA ESTO para ngModel!
import { CommonModule } from '@angular/common'; // <-- ¡IMPORTA ESTO para *ngFor!

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
  // Si es Standalone, necesitas declarar los módulos aquí:
  standalone: true, // <-- Si tienes esta línea
  imports: [
    CommonModule, // Contiene *ngIf, *ngFor, etc.
    FormsModule, // Contiene [(ngModel)]
    RouterModule // Contiene routerLink
  ] 
})
export class IndexComponent implements OnInit {
  // Propiedad para enlazar con el formulario de búsqueda
  busqueda = {
    origen: '',
    destino: '',
    fecha: new Date().toISOString().substring(0, 10) // Valor inicial
  };

  // Datos de ejemplo para los destinos destacados (reemplazar con datos reales de tu API)
  destinosDestacados = [
    { ruta: 'Lima - Cusco', imagenUrl: 'assets/images/Cusco.jpg', id: 1 },
    { ruta: 'Arequipa - Puno', imagenUrl: 'assets/images/Puno.jpg', id: 2 },
    { ruta: 'Trujillo - Chiclayo', imagenUrl: 'assets/images/Trujillo.jpg', id: 3 },
  ];

  // Datos de ejemplo para los servicios
  servicios = [
    { descripcion: 'Flota moderna y segura', imagenUrl: 'assets/images/servicio-flota.jpg' },
    { descripcion: 'Viajes corporativos', imagenUrl: 'assets/images/servicio-corp.jpg' },
    { descripcion: 'Compra online segura', imagenUrl: 'assets/images/servicio-online.jpg' },
    { descripcion: 'Atención 24/7', imagenUrl: 'assets/images/servicio-soporte.jpg' },
  ];

  slides = [
    { url: 'assets/images/Promocion.jpg', alt: 'Promoción 1' },
    { url: 'assets/images/Cusco.jpg', alt: 'Promoción 2' },
    { url: 'assets/images/Puno.jpg', alt: 'Promoción 3' },
  ];

  constructor(
    private router: Router,
    // private busService: BusService // Inyecta tu servicio aquí
  ) { }

  ngOnInit(): void {
    // Aquí puedes cargar la lista de destinos destacados al iniciar
  }

  // MÉTODOS DEL HEADER Y BUSCADOR
  
  cambiarIdioma(event: Event) {
    const target = event.target as HTMLSelectElement;
    console.log('Cambiando idioma a:', target.value);
    // Aquí iría la lógica para cambiar el idioma de la aplicación (i18n)
  }

  buscarViaje() {
    console.log('Buscando viaje:', this.busqueda);
    // 1. Llama a tu BusService de Angular, que a su vez llama a tu API de Node.js
    /*
    this.busService.buscar(this.busqueda).subscribe(
      (buses) => {
        // 2. Navega al componente de selección de asientos/viajes
        this.router.navigate(['/seleccion-asiento'], { state: { resultados: buses } });
      },
      (error) => {
        console.error('Error en la búsqueda:', error);
        alert('No se encontraron buses o hubo un error.');
      }
    );
    */
    // Por ahora, solo navegamos directamente para probar el ruteo
    this.router.navigate(['/seleccion-asiento']); 
  }

  seleccionarHoy() {
    this.busqueda.fecha = new Date().toISOString().substring(0, 10);
  }

  seleccionarManana() {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    this.busqueda.fecha = manana.toISOString().substring(0, 10);
  }
  
  // MÉTODOS DE DESTACADOS

  comprarDestacado(destino: any) {
    console.log('Iniciando compra para:', destino.ruta);
    // Puedes rellenar el formulario de búsqueda y luego navegar
    this.busqueda.destino = destino.ruta.split(' - ')[1]; // Asumiendo formato "Origen - Destino"
    this.router.navigate(['/seleccion-asiento']);
  }
}