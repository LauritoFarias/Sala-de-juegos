import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Card, CardService } from '../../../services/card.service';
import { MayorOMenorService, Partida } from '../../../services/mayor-o-menor.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-mayor-o-menor',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mayor-o-menor.html',
  styleUrls: ['./mayor-o-menor.scss']
})
export class MayorOMenor implements OnInit, OnDestroy {
  userData: any = null;

  currentCard: Card | null = null;
  nextCard: Card | null = null;
  score: number = 0;
  gameOver: boolean = false;
  message: string = '';
  deckId: string = '';
  showNextCard: boolean = false;
  gameInProgress: boolean = false;
  juegoId: number | null = null;
  
  constructor(
    private cardService: CardService,
    private mayorOMenorService: MayorOMenorService,
    private router: Router
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.userData = navigation.extras.state['userData'];
    }
  }

  async ngOnInit() {
    if (!this.userData) {
      console.warn('No se recibieron datos del usuario por la ruta');
    }

    try {
      this.juegoId = this.mayorOMenorService.idJuegoMayorOMenor;
      this.startNewGame();
    } catch (error) {
      console.error('Error initializing game:', error);
      this.message = 'Error al inicializar el juego';
    }
    
    window.addEventListener('beforeunload', this.saveGameBeforeUnload.bind(this));
  }

  ngOnDestroy() {
    if (this.gameInProgress && this.userData) {
      this.saveGame();
    }
    
    window.removeEventListener('beforeunload', this.saveGameBeforeUnload.bind(this));
  }

  startNewGame() {
    if (this.gameInProgress && this.userData && this.score > 0) {
      this.saveGame();
    }

    this.cardService.createNewDeck().subscribe(deckId => {
      this.deckId = deckId;
      this.score = 0;
      this.gameOver = false;
      this.gameInProgress = true;
      this.message = '¿La siguiente carta será Mayor o Menor?';
      this.showNextCard = false;
      this.nextCard = null;
      this.drawInitialCard();
    });
  }

  drawInitialCard() {
    this.cardService.drawCard(this.deckId).subscribe(card => {
      this.currentCard = card;
    });
  }

  play(guess: 'higher' | 'lower') {
    if (!this.currentCard || this.gameOver) return;

    this.cardService.drawCard(this.deckId).subscribe({
      next: (card) => {
        this.nextCard = card;
        this.checkGuess(guess, card);
      },
      error: (error) => {
        this.message = 'Error al sacar carta. Reiniciando juego...';
        this.startNewGame();
      }
    });
  }

  private checkGuess(guess: 'higher' | 'lower', nextCard: Card) {
    if (!this.currentCard) return;

    const currentVal = this.currentCard.numericValue;
    const nextVal = nextCard.numericValue;

    let correct = false;

    if (guess === 'higher' && nextVal > currentVal) {
      correct = true;
    } else if (guess === 'lower' && nextVal < currentVal) {
      correct = true;
    } else if (nextVal === currentVal) {
      this.message = '¡Empate! Las cartas son iguales. Continúa jugando.';
      this.currentCard = nextCard;
      return;
    }

    if (correct) {
      this.score += 10;
      this.message = `¡Correcto! +10 puntos. Total: ${this.score}`;
      this.currentCard = nextCard;
    } else {
      this.gameOver = true;
      this.gameInProgress = false;
      this.showNextCard = true;
      const translatedValue = this.translateValue(nextCard.value);
      const translatedSuit = this.translateSuit(nextCard.suit);
      this.message = `¡Game Over! Puntuación final: ${this.score}. La carta era: ${translatedValue} de ${translatedSuit}`;
      
      if (this.userData && this.juegoId) {
        this.saveGame();
      }
    }
  }

  private async saveGame() {
    if (!this.userData || !this.juegoId) return;

    try {
      const partidaData: Omit<Partida, 'id' | 'created_at'> = {
        id_juego: this.juegoId,
        id_usuario: this.userData.id,
        puntaje: this.score,
        completado_en: new Date().toISOString()
      };

      await this.mayorOMenorService.saveGame(partidaData);
      console.log('Partida guardada exitosamente');
    } catch (error) {
      console.error('Error al guardar la partida:', error);
    }
  }

  private saveGameBeforeUnload(event: BeforeUnloadEvent) {
    if (this.gameInProgress && this.userData && this.score > 0 && this.juegoId) {
      const partidaData = {
        id_juego: this.juegoId,
        id_usuario: this.userData.id,
        puntaje: this.score,
        completado_en: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(partidaData)], { type: 'application/json' });
      navigator.sendBeacon(`${environment.apiUrl}/rest/v1/partidas`, blob);
    }
  }

  volverAlHome() {
    this.router.navigate(['/home']);
  }

  translateValue(value: string): string {
    const translations: {[key: string]: string} = {
      'ACE': 'As',
      '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', 
      '7': '7', '8': '8', '9': '9', '10': '10',
      'JACK': 'Jota',
      'QUEEN': 'Reina',
      'KING': 'Rey'
    };
    return translations[value] || value;
  }

  translateSuit(suit: string): string {
    const translations: {[key: string]: string} = {
      'HEARTS': 'Corazones',
      'DIAMONDS': 'Diamantes',
      'CLUBS': 'Tréboles',
      'SPADES': 'Picas'
    };
    return translations[suit] || suit;
  }

  getTranslatedCard(card: Card | null): { value: string, suit: string } {
    if (!card) return { value: '', suit: '' };
    return {
      value: this.translateValue(card.value),
      suit: this.translateSuit(card.suit)
    };
  }

  onHigher() {
    this.play('higher');
  }

  onLower() {
    this.play('lower');
  }

  onRestart() {
    this.startNewGame();
  }
}