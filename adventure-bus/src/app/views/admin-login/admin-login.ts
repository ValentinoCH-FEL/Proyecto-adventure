import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core'; // 1. Importamos ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; 
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    RouterModule 
  ],
  templateUrl: './admin-login.html',
  styleUrls: ['./admin-login.scss']
})
export class AdminLoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef); // 2. Inyectamos el detector de cambios

  credentials = {
    username: '', 
    password: ''
  };

  loading: boolean = false;
  error: string = '';

  ngOnInit() {
    if (this.authService.hasToken()) {
      this.router.navigate(['/panel-administrador']);
    }
  }

  login() {
    this.loading = true;
    this.error = '';

    const loginData = {
        usuario: this.credentials.username.trim(), 
        password: this.credentials.password
    };

    this.authService.login(loginData).subscribe({
      next: (response: any) => {
        // Lógica de éxito
        this.loading = false; 
        
        if (response.token) {
          this.router.navigate(['/panel-administrador']);
        } else {
          this.error = "No se recibió un token válido.";
        }

        // 3. ¡LA SOLUCIÓN! Forzamos a Angular a pintar la vista ahora mismo
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        // Lógica de error
        this.loading = false;
        console.error("Login API Error:", err);
        
        if (err.status === 401 || err.status === 403) {
           this.error = "Usuario o contraseña incorrectos.";
        } else {
           this.error = "Error de conexión. Intenta más tarde.";
        }

        // 3. También forzamos la actualización aquí por si falla
        this.cdr.detectChanges(); 
      }
    });
  }
}