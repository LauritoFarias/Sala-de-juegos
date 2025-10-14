import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { Auth } from '../../services/auth';

const supabase = createClient(environment.apiUrl, environment.publicAnonKey);

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  email = '';
  password: string = '';
  showPassword = false;
  errorMessage = '';
  isLoggedIn = false;
  displayName = '';
  currentRoom: string | null = null;
  gameStatus = 'Inactivo';
  isLoading = false;

  constructor(
    private router: Router,
    private auth: Auth
  ) {
    (window as any).debugSupabase = supabase;
    (window as any).debugAuth = auth;
  }

  async login() {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      console.log('🚀 Iniciando proceso de login...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: this.email,
        password: this.password,
      });

      this.logLoginAttempt(error);

      if (error) {
        console.error('❌ Error de autenticación:', error.message);
        this.errorMessage = 'Credenciales incorrectas';
        this.isLoading = false;
        return;
      }

      console.log('✅ Autenticación exitosa con Supabase');
      console.log('🔄 Esperando establecimiento de sesión...');

      await this.waitForAuth(0);
      
    } catch (error: any) {
      console.error('💥 Error inesperado en login:', error);
      this.errorMessage = 'Error inesperado al iniciar sesión';
      this.isLoading = false;
    }
  }

  private async waitForAuth(attempt: number): Promise<void> {
    const maxAttempts = 10;
    
    if (attempt >= maxAttempts) {
      console.error('❌ Timeout: No se pudo establecer la sesión');
      this.errorMessage = 'Timeout: No se pudo completar el login';
      this.isLoading = false;
      return;
    }

    console.log(`🔍 Intento ${attempt + 1}/${maxAttempts} verificando autenticación...`);
    
    // Forzar verificación
    await this.auth.forceCheck();
    
    const user = this.auth.getCurrentUser();
    
    if (user) {
      console.log('🎉 ¡Login completado! Usuario:', user.nombre);
      console.log('👑 Rol:', user.role);
      this.isLoading = false;
      this.router.navigate(['/contenido/home']);
    } else {
      console.log('⏳ Sesión no lista, reintentando...');
      // Reintentar después de 500ms
      setTimeout(() => this.waitForAuth(attempt + 1), 500);
    }
  }

  private async logLoginAttempt(error: any): Promise<void> {
    try {
      const status = error ? 'error' : 'exito';
      await supabase
        .from('logs')
        .insert({ 
          mail: this.email, 
          status,
          error_message: error?.message || null
        });
    } catch (logError) {
      console.error('❌ Error al guardar log:', logError);
    }
  }

  logout() {
    this.isLoggedIn = false;
    this.email = '';
    this.password = '';
    this.currentRoom = null;
    this.displayName = '';
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  llenarCamposAccesoRapido(email: string) {
    this.email = email;
    switch (email) {
      case 'samsung.farias98@gmail.com':
        this.password = 'farias98';
        break;
    }
  }

  goTo(page: string) {
    this.router.navigate([page]);
  }
}