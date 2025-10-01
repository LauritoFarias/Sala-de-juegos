import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-footer',
  imports: [FormsModule, CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {

  constructor(private router: Router, public session: SessionService) {

  }

  title = 'Sala de juegos';
  year = new Date().getFullYear();

  errorMessage = '';

  goTo(page: string) {
    this.router.navigate([page]);
  }
}
