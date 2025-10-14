import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SupabaseService } from '../../../services/supabase.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-simon',
  imports: [CommonModule, RouterModule],
  templateUrl: './simon.html',
  styleUrl: './simon.scss'
})
export class Simon {
  userData: any = null;

  colors: string[] = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#FFBE0B',
    '#FF9F1C',
    '#8AC926',
    '#6A4C93',
    '#FF4D80'
  ];

  activeSector: number | null = null;
  sequence: number[] = [];
  userSequence: number[] = [];
  score: number = 0;
  round: number = 0;
  gameStarted: boolean = false;
  gameOver: boolean = false;
  isUserTurn: boolean = false;

  constructor(private supabaseService: SupabaseService, private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.userData = navigation.extras.state['userData'];
    }
    console.log('userData recibido:', this.userData);
    
    window.addEventListener('beforeunload', () => this.saveGameOnUnload());
  }

  getSegmentTransform(index: number): string {
    const angle = 45 * index;
    return `rotate(${angle}deg)`;
  }

  startGame(): void {
    this.sequence = [];
    this.userSequence = [];
    this.score = 0;
    this.round = 0;
    this.gameStarted = true;
    this.gameOver = false;
    this.isUserTurn = false;
    this.nextRound();
  }

  nextRound(): void {
    this.round++;
    this.userSequence = [];
    this.isUserTurn = false;
    
    const newColor = Math.floor(Math.random() * this.colors.length);
    this.sequence.push(newColor);
    
    this.showSequence();
  }

  showSequence(): void {
    let delay = 0;
    
    this.sequence.forEach((colorIndex, i) => {
      setTimeout(() => {
        this.activateColor(colorIndex);
        
        setTimeout(() => {
          this.activeSector = null;
          
          if (i === this.sequence.length - 1) {
            setTimeout(() => {
              this.isUserTurn = true;
            }, 500);
          }
        }, 600);
      }, delay);
      
      delay += 800;
    });
  }

  activateColor(index: number): void {
    this.activeSector = index;
  }

  onColorClick(index: number): void {
    if (!this.isUserTurn || this.gameOver) return;

    this.activateColor(index);
    this.userSequence.push(index);

    const currentIndex = this.userSequence.length - 1;
    if (this.userSequence[currentIndex] !== this.sequence[currentIndex]) {
      this.endGame();
      return;
    }

    setTimeout(() => {
      this.activeSector = null;
    }, 300);

    if (this.userSequence.length === this.sequence.length) {
      this.score += 10;
      setTimeout(() => {
        this.nextRound();
      }, 1000);
    }
  }

  async endGame(): Promise<void> {
    this.gameOver = true;
    this.gameStarted = false;
    this.isUserTurn = false;
    
    await this.saveGame();
  }

  async saveGame(): Promise<void> {
    if (!this.userData) {
      console.log('No hay usuario logueado, no se guardará la partida.');
      return;
    }

    try {
      const gameData = {
        id_juego: 4,
        id_usuario: this.userData.id,
        puntaje: this.score,
        completado_en: new Date().toISOString()
      };

      const { data, error } = await this.supabaseService.insertGame(gameData);
      
      if (error) {
        console.error('Error al guardar la partida:', error);
      } else {
        console.log('Partida guardada exitosamente:', data);
      }
    } catch (error) {
      console.error('Error inesperado al guardar la partida:', error);
    }
  }

  async saveGameOnUnload(): Promise<void> {
    if (this.gameStarted && this.score > 0) {
      await this.saveGame();
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('beforeunload', () => this.saveGameOnUnload());
  }
}