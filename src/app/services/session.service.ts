import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  title = 'Sala de juegos';
  year = new Date().getFullYear();

  email = '';
  password = '';
  showPassword = false;
  errorMessage = '';
  isLoggedIn = false;
  displayName = '';

  currentRoom: string | null = null;
  gameStatus = 'Inactivo';

  resetSession() {
    this.isLoggedIn = false;
    this.email = '';
    this.password = '';
    this.currentRoom = null;
    this.displayName = '';
    this.gameStatus = 'Inactivo';
  }
}