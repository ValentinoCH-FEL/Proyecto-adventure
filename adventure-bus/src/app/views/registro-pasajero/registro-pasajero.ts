import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

// Interfaz estricta para el pasajero
interface Pasajero {
  asientoNumero: string;
  piso: number;
  precio: number;
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento: string;
  genero: string;
  nacionalidad: string;
  correoElectronico: string;
  edad?: number; // Campo auxiliar calculado
}

@Component({
  selector: 'app-registro-pasajero',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro-pasajero.html',
  styleUrls: ['./registro-pasajero.scss']
})
export class RegistroPasajeroComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  
  // --- TIMER (10 minutos) ---
  timeLeft = signal(600); 
  isExpired = signal(false);
  private timerSub: Subscription | null = null;

  formattedTime = computed(() => {
    const minutes = Math.floor(this.timeLeft() / 60);
    const seconds = this.timeLeft() % 60;
    return `${this.pad(minutes)}:${this.pad(seconds)}`;
  });

  reservaData: any = null;
  pasajeros: Pasajero[] = [];
  formSubmitted = false; 

  tiposDocumento = [
    { valor: 'DNI', texto: 'DNI (Documento Nacional)' },
    { valor: 'PASAPORTE', texto: 'Pasaporte' },
    { valor: 'CE', texto: 'Carnet de Extranjería' }
  ];

  generos = [
    { valor: 'M', texto: 'Masculino' },
    { valor: 'F', texto: 'Femenino' }
  ];

  nacionalidades = [
    'Peruana', 'Argentina', 'Boliviana', 'Chilena', 'Colombiana', 'Ecuatoriana', 'Venezolana', 'Otra'
  ];

  ngOnInit() {
    this.cargarDatos();
    this.iniciarTimer();
  }

  ngOnDestroy() {
    if (this.timerSub) this.timerSub.unsubscribe();
  }

  iniciarTimer() {
    this.timerSub = interval(1000)
      .pipe(takeWhile(() => this.timeLeft() > 0))
      .subscribe(() => {
        this.timeLeft.update(v => v - 1);
        if (this.timeLeft() === 0) {
          this.isExpired.set(true);
        }
      });
  }

  pad(num: number): string {
    return num < 10 ? `0${num}` : num.toString();
  }

  reiniciarProceso() {
    this.router.navigate(['/']); 
  }

  cargarDatos() {
    try {
      const data = localStorage.getItem('reserva_temporal');
      if (data) {
        this.reservaData = JSON.parse(data);
        
        if (!this.reservaData.asientos || this.reservaData.asientos.length === 0) {
          this.router.navigate(['/']);
          return;
        }

        if (this.reservaData.pasajeros && this.reservaData.pasajeros.length > 0) {
           this.pasajeros = this.reservaData.pasajeros;
        } else {
           this.pasajeros = this.reservaData.asientos.map((asiento: any) => ({
            asientoNumero: asiento.numero,
            piso: asiento.piso,
            precio: asiento.precio,
            tipoDocumento: 'DNI', 
            numeroDocumento: '',
            nombres: '',
            apellidoPaterno: '',
            apellidoMaterno: '',
            fechaNacimiento: '',
            genero: '', // Inicialmente vacío para obligar selección
            nacionalidad: 'Peruana',
            correoElectronico: ''
          }));
        }
      } else {
        this.router.navigate(['/']);
      }
    } catch (e) {
      console.error("Error al leer datos", e);
      this.router.navigate(['/']);
    }
  }

  copiarEmailATodos() {
    const emailTitular = this.pasajeros[0].correoElectronico;
    if (emailTitular) {
      for (let i = 1; i < this.pasajeros.length; i++) {
        this.pasajeros[i].correoElectronico = emailTitular;
      }
    }
  }

  isFieldInvalid(model: any): boolean {
    return (model && model.invalid && (model.dirty || model.touched || this.formSubmitted));
  }

  // --- LÓGICA CORE: CÁLCULO DE EDAD EXACTA ---
  private calcularEdad(fechaNacimiento: string): number {
    const hoy = new Date();
    const cumpleanos = new Date(fechaNacimiento + 'T12:00:00'); 
    
    let edad = hoy.getFullYear() - cumpleanos.getFullYear();
    const m = hoy.getMonth() - cumpleanos.getMonth();

    if (m < 0 || (m === 0 && hoy.getDate() < cumpleanos.getDate())) {
        edad--;
    }
    return edad;
  }

  // --- VALIDACIÓN PROFESIONAL ---
  procesarYContinuar() {
    this.formSubmitted = true;
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
    
    let mensajeError = "";
    let contadorAdultos = 0;
    let contadorMenores = 0;

    for (const [index, p] of this.pasajeros.entries()) {
      const numPasajero = index + 1;

      // A. Campos Vacíos (AHORA INCLUYE GÉNERO Y NACIONALIDAD)
      if (!p.nombres || !p.apellidoPaterno || !p.numeroDocumento || 
          !p.fechaNacimiento || !p.correoElectronico || !p.genero || !p.nacionalidad) {
        mensajeError = `Por favor, completa todos los datos obligatorios del Pasajero ${numPasajero}.`;
        break;
      }

      // B. Formato de Correo
      if (!emailRegex.test(p.correoElectronico)) {
        mensajeError = `El correo electrónico del Pasajero ${numPasajero} no es válido.`;
        break;
      }

      // C. Validación Documento
      if (p.tipoDocumento === 'DNI') {
        if (!/^\d{8}$/.test(p.numeroDocumento)) {
           mensajeError = `El DNI del Pasajero ${numPasajero} debe tener exactamente 8 números.`;
           break;
        }
      } else {
        if (!/^[a-zA-Z0-9]{6,12}$/.test(p.numeroDocumento)) {
           mensajeError = `El documento del Pasajero ${numPasajero} tiene un formato inválido.`;
           break;
        }
      }

      // D. Validación de Edad
      const edad = this.calcularEdad(p.fechaNacimiento);
      p.edad = edad;

      if (edad < 0) {
        mensajeError = `La fecha de nacimiento del Pasajero ${numPasajero} es inválida.`;
        break;
      }

      if (edad >= 18) {
        contadorAdultos++;
      } else {
        contadorMenores++;
      }
    }

    if (mensajeError) {
      alert(mensajeError);
      return;
    }

    // Regla de Menores
    if (contadorMenores > 0 && contadorAdultos === 0) {
      alert("⚠️ POLÍTICA DE VIAJE:\n\nLos menores de edad no pueden viajar solos. Debe incluir al menos un adulto (18+) en la reserva.");
      return;
    }

    // --- TODO OK ---
    const reservaActualizada = {
      ...this.reservaData,
      pasajeros: this.pasajeros
    };

    try {
      localStorage.setItem('reserva_temporal', JSON.stringify(reservaActualizada));
      this.router.navigate(['/pago']); 
    } catch (e) {
      console.error(e);
      alert("Error al guardar los datos. Intente nuevamente.");
    }
  }
}