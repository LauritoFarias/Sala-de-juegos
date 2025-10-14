import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { Header } from './componente/header/header';
import { Footer } from './componente/footer/footer';
import { Auth } from './services/auth';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    FormsModule, 
    CommonModule,
    Header, 
    Footer
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  constructor(private auth: Auth) {}

  async ngOnInit() {
    console.log('Aplicación inicializada');
    
    const authState = await this.auth.getAuthState();
    console.log('Estado de auth al iniciar app:', authState);
  }

}
