import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { SessionService } from '../../services/session.service';
import { environment } from '../../../environments/environment';
import { createClient } from '@supabase/supabase-js';
import { UserData } from '../../models/user-data';

const supabase = createClient(environment.apiUrl, environment.publicAnonKey)

@Component({
  selector: 'app-home',
  imports: [FormsModule, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {

  usersdata: UserData[] = []
  year = new Date().getFullYear();

  constructor(private router: Router, public session: SessionService) {

  }

  ngOnInit(): void {
    this.getUserData();
  }

  getUserData() {
    supabase.from('users').select('*').then(({ data, error }) => {
      if (error) {
        console.error('Error:', error.message);
      } else {
        console.log('Data:', data);
        this.usersdata = data;
      }
    }
    );
  }

  getAvatarUrl(avatarUrl: string) {
    return supabase.storage.from('images').getPublicUrl(avatarUrl).data.publicUrl;
  }

  logout() {
    this.session.isLoggedIn = false;
    this.session.email = '';
    this.session.password = '';
    this.session.currentRoom = null;
    this.session.displayName = '';
  }

  enterRoom(name: string) {
    this.goTo(name);
    this.session.currentRoom = name;
    this.session.gameStatus = 'Esperando jugadores';
  }

  leaveRoom() {
    this.session.currentRoom = null;
    this.session.gameStatus = 'Inactivo';
  }

  startQuickGame() {
    this.session.currentRoom = 'Partida rápida';
    this.session.gameStatus = 'En juego';
  }

  openSettings() {
    alert('Abrir configuración (implementar).');
  }

  goTo(page: string) {
    this.router.navigate([page]);
  }
}
