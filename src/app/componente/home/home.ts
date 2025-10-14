import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, Router } from '@angular/router';
import { SessionService } from '../../services/session.service';
import { environment } from '../../../environments/environment';
import { createClient } from '@supabase/supabase-js';
import { UserData } from '../../models/user-data';
import { Chat } from './chat/chat'
import { JuegosRoutingModule } from "../../modules/juegos/juegos-routing-module";
import { Auth } from '../../services/auth';

const supabase = createClient(environment.apiUrl, environment.publicAnonKey)

@Component({
  selector: 'app-home',
  imports: [FormsModule, CommonModule, Chat, JuegosRoutingModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {

  isAdmin = false;
  userName = '';
  usersdata: UserData | null = null;
  year = new Date().getFullYear();

  chatAbierto = false;
  cerrarChat = () => this.abrirChat()

  constructor(
    private router: Router, 
    public session: SessionService,
    private authService: Auth
  ) {}

  async ngOnInit(): Promise<void> {
    await this.getUserData();
    await this.checkAdminStatus();
  }

  async getUserData() {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error('Error al obtener el usuario:', userError.message);
      return;
    }

    if (!user) {
      console.warn('No hay usuario autenticado');
      return;
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('userId', user.id)
      .single();

    if (error) {
      console.error('Error al obtener datos del usuario:', error.message);
    } else {
      console.log('Datos del usuario:', data);
      this.usersdata = data;
    }
  }

  // Método para verificar si el usuario es administrador
  async checkAdminStatus() {
    try {
      this.isAdmin = await this.authService.isAdmin();
      console.log('¿Es administrador?:', this.isAdmin);
    } catch (error) {
      console.error('Error al verificar rol de administrador:', error);
      this.isAdmin = false;
    }
  }

  goToAdminPanel() {
    this.router.navigate(['contenido/admin/encuestas']);
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

  abrirChat() {
    this.chatAbierto = !this.chatAbierto;
  }

  goTo(page: string) {
    this.router.navigate([page]);
  }

  goToAhorcado() {
    if (this.usersdata) {
      const userDataString = JSON.stringify(this.usersdata);
      this.router.navigate(['/juegos/ahorcado'], { 
        state: { userData: this.usersdata } 
      });
    } else {
      this.router.navigate(['/juegos/ahorcado']);
    }
  }

  goToMayorOMenor() {
    if (this.usersdata) {
      const userDataString = JSON.stringify(this.usersdata);
      this.router.navigate(['/juegos/mayor-o-menor'], { 
        state: { userData: this.usersdata } 
      });
    } else {
      this.router.navigate(['/juegos/mayor-o-menor']);
    }
  }

  navegarAPreguntados() {
    if (this.usersdata) {
      const userDataString = JSON.stringify(this.usersdata);
      this.router.navigate(['/juegos/preguntados'], { 
        state: { userData: this.usersdata } 
      });
    } else {
      this.router.navigate(['/juegos/preguntados']);
    }
  }

  goToSimon() {
    if (this.usersdata) {
      const userDataString = JSON.stringify(this.usersdata);
      this.router.navigate(['/juegos/simon'], { 
        state: { userData: this.usersdata } 
      });
    } else {
      this.router.navigate(['/juegos/simon']);
    }
  }
}