import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

const supabase = createClient(environment.apiUrl, environment.publicAnonKey)

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  constructor(private router: Router) {

  }

  title = 'Sala de juegos';
  year = new Date().getFullYear();

  email = '';
  password: string = '';
  showPassword = false;
  errorMessage = '';
  isLoggedIn = false;
  displayName = '';

  currentRoom: string | null = null;
  gameStatus = 'Inactivo';

  login() {
  supabase.auth.signInWithPassword({
    email: this.email,
    password: this.password,
  }).then(async ({ data, error }) => {
    let status = error ? 'error' : 'exito';

    const { error: insertError } = await supabase
      .from('logs')
      .insert({ mail: this.email, status });

    if (insertError) {
      console.error('Error insertando log:', insertError.message);
    }

    if (!error) {
      this.goTo('/home');
    } else {
      console.error('Error login:', error.message);
    }
  });
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

  useGuest() {
    this.email = 'invitado@local';
    this.displayName = 'Invitado';
    this.isLoggedIn = true;
    this.currentRoom = null;
    this.gameStatus = 'Listo';
    this.goTo('../home')
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
