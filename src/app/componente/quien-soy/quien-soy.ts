import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-quien-soy',
  imports: [FormsModule, CommonModule],
  templateUrl: './quien-soy.html',
  styleUrl: './quien-soy.scss'
})
export class QuienSoy {

  constructor(private router: Router, public session: SessionService) {

  }

  year = new Date().getFullYear();

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
