import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { SessionService } from '../../services/session.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-footer',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {

  constructor(private router: Router, public session: SessionService, private location: Location) {

  }

  title = 'Sala de juegos';
  year = new Date().getFullYear();

  errorMessage = '';

  goTo(page: string) {
    this.router.navigate([page]);
  }

  volver(): void {
    this.location.back();
  }
}
