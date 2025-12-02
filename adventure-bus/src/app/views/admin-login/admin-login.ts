import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; // 1. Importamos RouterModule
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    RouterModule // 2. Agregamos RouterModule aquí para que routerLink funcione
  ],
  templateUrl: './admin-login.html',
  styleUrls: ['./admin-login.scss']
})
export class AdminLoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  credentials = {
    username: '', // En tu BD es 'usuario'
    password: ''
  };

  loading: boolean = false;
  error: string = '';

  ngOnInit() {
    // Si ya está logueado, lo mandamos al panel
    if (this.authService.hasToken()) {
      this.router.navigate(['/panel-administrador']);
    }
  }

  login() {
    this.loading = true;
    this.error = '';

    // NOTA: Tu backend espera 'usuario' y 'contraseña' o similar.
    // Ajusta la estructura del objeto que envías si es diferente.
    const loginData = {
        usuario: this.credentials.username, 
        password: this.credentials.password
    };


    this.authService.login(loginData).subscribe({
      next: (response: any) => {
        this.loading = false;
        
        // El servicio devuelve el objeto de respuesta o un error
        if (response.token) {
          alert("✅ Acceso concedido.");
          this.router.navigate(['/panel-administrador']);
        } else {
          // Si llega un error de backend sin token
          this.error = "Credenciales inválidas o error de servidor.";
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = "Error de conexión o credenciales incorrectas. Intenta de nuevo.";
        console.error("Login API Error:", err);
      }
    });
  }
}