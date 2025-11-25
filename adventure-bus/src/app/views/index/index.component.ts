import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core'; // <-- Importado ChangeDetectionStrategy
import { CommonModule } from '@angular/common';
// Importación crucial para formularios reactivos
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; 
import { Router } from '@angular/router';

// Definición de tipos para las rutas y destinos (mock de datos)
interface Destination {
  id: number;
  name: string;
}

@Component({
  selector: 'app-index',
  standalone: true,
  // CRÍTICO: ReactiveFormsModule es necesario para [formGroup] y formControlName
  imports: [CommonModule, ReactiveFormsModule], 
  // CRÍTICO: Usaremos archivos externos para el template y estilos
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'], 
  changeDetection: ChangeDetectionStrategy.OnPush // <-- CORREGIDO: Usando la enumeración OnPush
})
export class IndexComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  searchForm!: FormGroup;
  
  // Mock de datos para llenar los Selects
  destinations: Destination[] = [
    { id: 1, name: 'Lima' },
    { id: 2, name: 'Cusco' },
    { id: 3, name: 'Arequipa' },
    { id: 4, name: 'Trujillo' },
    { id: 5, name: 'Ica' },
  ]; 

  ngOnInit(): void {
    // Inicialización del formulario de búsqueda
    this.searchForm = this.fb.group({
      origin: ['', Validators.required],
      destination: ['', Validators.required],
      date: ['', Validators.required],
      passengers: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
    });
  }

  /**
   * Procesa la búsqueda de rutas de autobús y navega al componente de resultados.
   */
  onSubmit() {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    const { origin, destination, date, passengers } = this.searchForm.value;

    console.log('Buscando rutas:', { origin, destination, date, passengers });

    // Navegar a la página de resultados de la búsqueda (asumiendo que tienes una ruta '/busqueda')
    // Pasamos los parámetros de búsqueda como queryParams en la URL.
    this.router.navigate(['/busqueda'], { 
      queryParams: { 
        origen: origin, 
        destino: destination, 
        fecha: date, 
        pasajeros: passengers 
      } 
    });
  }
}