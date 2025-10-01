import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-header',
  imports: [FormsModule, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {

  constructor(private router: Router, public session: SessionService) {

  }

  title = 'Sala de juegos';
  year = new Date().getFullYear();

  errorMessage = '';

  logout() {
    this.session.isLoggedIn = false;
    this.session.email = '';
    this.session.password = '';
    this.session.currentRoom = null;
    this.session.displayName = '';
  }

  goTo(page: string) {
    this.router.navigate([page]);
  }
}
