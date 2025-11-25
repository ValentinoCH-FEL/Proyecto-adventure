import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // <-- Necesario para *ngIf

// Interfaz para la respuesta de tu API (opcional pero buena práctica)
interface LoginResponse {
  token: string;
  role: string;
}

@Component({
  selector: 'app-admin-login',
  standalone: true,
  // ESTO SOLUCIONA LOS ERRORES: Importa los módulos necesarios para usar formularios y NgIf/NgFor.
  imports: [CommonModule, ReactiveFormsModule], 
  // Usa las rutas correctas para tus archivos de plantilla y estilos
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
// IMPORTANTE: El nombre de la clase debe ser AdminLoginComponent
export class AdminLoginComponent implements OnInit { 
  // Inyección de dependencias (FormBuilder y Router)
  private fb = inject(FormBuilder);
  private router = inject(Router);

  // Propiedades del componente
  loginForm!: FormGroup; // Formulario reactivo
  errorMessage: string | null = null;
  isLoading: boolean = false;

  // URL de tu API de login (Asegúrate que coincida)
  private readonly LOGIN_API_URL = 'http://localhost:3000/api/admin/login'; 

  ngOnInit(): void {
    // Inicialización del formulario con validadores
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  /**
   * Procesa el intento de login y llama a la API.
   */
  async onSubmit() {
    this.errorMessage = null;
    
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); 
      return;
    }

    this.isLoading = true;
    
    const { username, password } = this.loginForm.value;

    try {
      const response = await fetch(this.LOGIN_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Credenciales inválidas.');
      }

      const data: LoginResponse = await response.json();
      
      // Guardar token para futuras peticiones (ejemplo: localStorage)
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_role', data.role); 

      // Navegar a la página de administración
      this.router.navigate(['/panel-administrador']);

    } catch (error: any) {
      console.error('Error de autenticación:', error);
      this.errorMessage = error.message; 
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Getter para acceder fácilmente a los controles del formulario en la plantilla HTML
   */
  get f() {
    return this.loginForm.controls;
  }
}