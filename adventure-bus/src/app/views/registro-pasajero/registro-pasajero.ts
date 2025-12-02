import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Template-driven forms
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-registro-pasajero',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro-pasajero.html',
  styleUrls: ['./registro-pasajero.scss']
})
export class RegistroPasajeroComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  
  // --- SIGNALS PARA EL TIMER ---
  // 600 segundos = 10 minutos
  timeLeft = signal(600); 
  isExpired = signal(false);
  private timerSub: Subscription | null = null;

  // Formato MM:SS computado automáticamente
  formattedTime = computed(() => {
    const minutes = Math.floor(this.timeLeft() / 60);
    const seconds = this.timeLeft() % 60;
    return `${this.pad(minutes)}:${this.pad(seconds)}`;
  });

  reservaData: any = null;
  pasajeros: any[] = [];
  
  // Variable para controlar si se intentó enviar el formulario (para mostrar errores masivos)
  formSubmitted = false; 

  tiposDocumento = [
    { valor: 'DNI', texto: 'DNI' },
    { valor: 'PASAPORTE', texto: 'Pasaporte' },
    { valor: 'CE', texto: 'Carnet de Extranjería' }
  ];

  generos = [
    { valor: 'M', texto: 'Masculino' },
    { valor: 'F', texto: 'Femenino' }
  ];

  nacionalidades = [
    'Peruana', 'Argentina', 'Boliviana', 'Chilena', 'Colombiana', 'Ecuatoriana', 'Otra'
  ];

  ngOnInit() {
    this.cargarDatos();
    this.iniciarTimer();
  }

  ngOnDestroy() {
    if (this.timerSub) this.timerSub.unsubscribe();
  }

  // --- LÓGICA DEL TIMER ---
  iniciarTimer() {
    this.timerSub = interval(1000)
      .pipe(takeWhile(() => this.timeLeft() > 0))
      .subscribe(() => {
        this.timeLeft.update(v => v - 1);
        if (this.timeLeft() === 0) {
          this.isExpired.set(true);
          // Opcional: Limpiar localStorage o avisar al backend para liberar asientos
        }
      });
  }

  pad(num: number): string {
    return num < 10 ? `0${num}` : num.toString();
  }

  reiniciarProceso() {
    // Lógica para volver al inicio cuando expira
    this.router.navigate(['/']); 
  }

  cargarDatos() {
    const data = localStorage.getItem('reserva_temporal');
    if (data) {
      this.reservaData = JSON.parse(data);
      
      if (!this.reservaData.asientos || this.reservaData.asientos.length === 0) {
        this.router.navigate(['/']);
        return;
      }

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
        genero: '',
        nacionalidad: 'Peruana',
        correoElectronico: ''
      }));
    } else {
      this.router.navigate(['/']);
    }
  }

  // Validar si un campo es inválido visualmente
  isFieldInvalid(model: any): boolean {
    // Es inválido si: (Fue tocado O se intentó enviar el form) Y tiene errores
    return (model.invalid && (model.dirty || model.touched || this.formSubmitted));
  }

  procesarYContinuar() {
    this.formSubmitted = true;

    // Validación manual extra antes de guardar
    // Verificamos si hay algún input inválido en el DOM o campos vacíos
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
    let hayErrores = false;

    for (const p of this.pasajeros) {
      if (!p.nombres || !p.apellidoPaterno || !p.numeroDocumento || !p.fechaNacimiento || !p.correoElectronico) {
        hayErrores = true;
        break;
      }
      // Validación extra de formato de correo
      if (!emailRegex.test(p.correoElectronico)) {
        hayErrores = true; 
        break;
      }
    }

    if (hayErrores) {
      // El usuario verá los bordes rojos gracias a la variable formSubmitted
      alert("Por favor, corrige los errores marcados en rojo antes de continuar.");
      return;
    }

    // Guardar y Navegar
    const reservaActualizada = {
      ...this.reservaData,
      pasajeros: this.pasajeros
    };

    localStorage.setItem('reserva_temporal', JSON.stringify(reservaActualizada));
    this.router.navigate(['/pago']); 
  }
}