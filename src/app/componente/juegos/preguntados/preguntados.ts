import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SimpsonsService, Character } from '../../../services/simpsons.service';
import { CommonModule } from '@angular/common';
import { SupabaseService, Partida } from '../../../services/supabase.service';

const ID_JUEGO_PREGUNTADOS = 3;

@Component({
  selector: 'app-preguntados',
  imports: [CommonModule, RouterModule],
  templateUrl: './preguntados.html',
  styleUrl: './preguntados.scss'
})
export class Preguntados implements OnInit, OnDestroy {
  userData: any = null;

  characters: Character[] = [];
  currentCharacter!: Character;
  options: Character[] = [];
  lives: number = 3;
  score: number = 0;
  gameOver: boolean = false;
  gameStarted: boolean = false;
  message: string = '';
  isLoading: boolean = true;
  error: string = '';

  // Sistema anti-repetición
  private recentCharacters: number[] = [];
  private readonly MAX_RECENT = 10;

  private partidaIniciada: boolean = false;
  public partidaGuardada: boolean = false;

  constructor(
    private simpsonsService: SimpsonsService,
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.userData = navigation.extras.state['userData'];
    }
  }

  ngOnInit(): void {
    console.log('Preguntados Component - ngOnInit');
    console.log('userData recibido:', this.userData);
    
    window.addEventListener('beforeunload', this.guardarPartidaAntesDeSalir.bind(this));
    this.loadCharacters();
  }

  ngOnDestroy(): void {
    console.log('Preguntados Component - ngOnDestroy');
    
    this.guardarPartidaSiEsNecesario('navegacion');
    // Remover listener
    window.removeEventListener('beforeunload', this.guardarPartidaAntesDeSalir.bind(this));
  }

  private guardarPartidaAntesDeSalir(event: BeforeUnloadEvent): void {
    console.log('BeforeUnload event triggered');
    if (this.partidaIniciada && !this.partidaGuardada) {
      
      this.guardarPartidaSync();
      event.preventDefault();
      event.returnValue = '';
    }
  }

  private guardarPartidaSync(): void {
    if (this.partidaGuardada || !this.userData?.id) return;

    console.log('Guardando partida de forma síncrona...');
    
    const partida: Omit<Partida, 'id'> = {
      id_juego: ID_JUEGO_PREGUNTADOS,
      id_usuario: this.userData.id,
      puntaje: this.score,
      completado_en: new Date().toISOString()
    };

    this.guardarPartidaConFetch(partida);
  }

  private async guardarPartidaConFetch(partida: Omit<Partida, 'id'>): Promise<void> {
    try {
      console.log('Intentando guardar con fetch:', partida);
    } catch (error) {
      console.error('Error en guardado con fetch:', error);
    }
  }

  private async guardarPartidaSiEsNecesario(motivo: string): Promise<void> {
    console.log(`Verificando si es necesario guardar partida (${motivo}):`, {
      partidaIniciada: this.partidaIniciada,
      partidaGuardada: this.partidaGuardada,
      userId: this.userData?.id
    });

    if (this.partidaIniciada && !this.partidaGuardada && this.userData?.id) {
      await this.guardarPartida(motivo);
    }
  }

  private async guardarPartida(motivo: string): Promise<void> {
    console.log(`Iniciando guardado de partida (${motivo})...`, {
      partidaGuardada: this.partidaGuardada,
      userId: this.userData?.id,
      score: this.score
    });

    if (this.partidaGuardada || !this.userData?.id) {
      console.log('No se guarda la partida porque:', {
        partidaGuardada: this.partidaGuardada,
        tieneUserId: !!this.userData?.id
      });
      return;
    }

    try {
      const partida: Omit<Partida, 'id'> = {
        id_juego: ID_JUEGO_PREGUNTADOS,
        id_usuario: this.userData.id,
        puntaje: this.score,
        completado_en: new Date().toISOString()
      };

      console.log('Enviando partida a Supabase:', partida);
      const resultado = await this.supabaseService.guardarPartida(partida);
      console.log('Respuesta de Supabase:', resultado);
      
      this.partidaGuardada = true;
      console.log(`✅ Partida guardada exitosamente (${motivo}): ${this.score} puntos`);
    } catch (error) {
      console.error('❌ Error al guardar partida:', error);
    }
  }

  loadCharacters(): void {
    this.isLoading = true;
    this.error = '';
    
    this.simpsonsService.getCharacters().subscribe({
      next: (characters) => {
        if (characters.length < 10) {
          this.error = 'No se pudieron cargar suficientes personajes. Se necesitan al menos 10.';
          return;
        }
        
        this.characters = characters;
        this.startGame();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.error = err.message || 'Error al cargar los personajes desde la API.';
        this.isLoading = false;
      }
    });
  }

  startGame(): void {
    if (this.characters.length < 3) {
      this.error = 'No hay suficientes personajes para jugar. Se necesitan al menos 3.';
      return;
    }

    console.log('Iniciando nueva partida...');
    this.gameStarted = true;
    this.gameOver = false;
    this.lives = 3;
    this.score = 0;
    this.recentCharacters = [];
    this.partidaIniciada = true;
    this.partidaGuardada = false;
    this.nextQuestion();
  }

  nextQuestion(): void {
    const availableCharacters = this.characters.filter(
      char => !this.recentCharacters.includes(char.id)
    );

    const charactersPool = availableCharacters.length >= 3 ? 
      availableCharacters : this.characters;

    const randomIndex = Math.floor(Math.random() * charactersPool.length);
    this.currentCharacter = { ...charactersPool[randomIndex] };
    
    this.addToRecent(this.currentCharacter.id);
    
    this.options = [this.currentCharacter];
    
    const otherCharacters = this.characters.filter(char => 
      char.id !== this.currentCharacter.id && 
      !this.recentCharacters.includes(char.id)
    );
    
    const availableOthers = otherCharacters.length >= 2 ? 
      otherCharacters : 
      this.characters.filter(char => char.id !== this.currentCharacter.id);
    
    const shuffledOthers = this.shuffleArray([...availableOthers]).slice(0, 2);
    this.options.push(...shuffledOthers);
    
    this.options = this.shuffleArray(this.options);
    
    this.message = '';
  }

  private addToRecent(characterId: number): void {
    this.recentCharacters.push(characterId);
    
    if (this.recentCharacters.length > this.MAX_RECENT) {
      this.recentCharacters = this.recentCharacters.slice(-this.MAX_RECENT);
    }
  }

  async selectOption(selectedCharacter: Character): Promise<void> {
    if (this.gameOver) return;

    if (selectedCharacter.id === this.currentCharacter.id) {
      this.score += 10;
      this.message = '¡Correcto!';
      setTimeout(() => {
        this.nextQuestion();
      }, 1000);
    } else {
      this.lives--;
      this.message = `Incorrecto. Era ${this.currentCharacter.name}.`;
      
      if (this.lives <= 0) {
        this.gameOver = true;
        this.message = `¡Juego terminado! Puntuación final: ${this.score}`;
        console.log('Juego terminado por derrota, guardando partida...');
        // Guardar partida cuando se pierde
        await this.guardarPartida('derrota');
      } else {
        setTimeout(() => {
          this.nextQuestion();
        }, 1500);
      }
    }
  }

  async restartGame(): Promise<void> {
    console.log('Reiniciando juego...');
    // Guardar partida actual antes de reiniciar
    await this.guardarPartidaSiEsNecesario('reinicio');
    this.startGame();
  }

  shuffleArray(array: any[]): any[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  retryLoad(): void {
    this.loadCharacters();
  }

  handleImageError(event: any): void {
    event.target.src = 'https://via.placeholder.com/150/FFD90F/000000?text=?';
  }
}
