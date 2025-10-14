import { Component, OnDestroy, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PALABRAS } from './palabras.data';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-ahorcado',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ahorcado.html',
  styleUrls: ['./ahorcado.scss']
})
export class Ahorcado implements OnDestroy {
  userData: any = null;

  palabras = PALABRAS;
  abecedario: string[] = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

  palabraSeleccionada!: string;
  palabraMostrada!: string[];
  letrasErradas: string[] = [];
  errores = 0;
  maxErrores = 6;
  juegoTerminado = false;
  mensajeFinal = '';
  imagenMonigote = 'assets/illustrations/monigote-1.png';
  partidaGuardada = false;
  puntuacionTotal = 0;
  palabrasAdivinadas = 0;

  @ViewChildren('btn') botonesTeclado!: QueryList<ElementRef<HTMLButtonElement>>;

  constructor(private supabaseService: SupabaseService, private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.userData = navigation.extras.state['userData'];
    }
    console.log('userData recibido:', this.userData);
    this.setupBeforeUnload();
    this.iniciarJuego();
  }

  private setupBeforeUnload() {
    window.addEventListener('beforeunload', this.guardarPartidaAntesDeSalir);
  }

  private guardarPartidaAntesDeSalir = () => {
    if (!this.juegoTerminado && this.palabraSeleccionada && !this.partidaGuardada) {
      this.guardarPartida('abandonada');
    }
  }

  ngOnDestroy() {
    window.removeEventListener('beforeunload', this.guardarPartidaAntesDeSalir);
    if (!this.juegoTerminado && this.palabraSeleccionada && !this.partidaGuardada) {
      this.guardarPartida('abandonada');
    }
  }

  iniciarJuego() {
    this.puntuacionTotal = 0;
    this.palabrasAdivinadas = 0;
    this.juegoTerminado = false;
    this.mensajeFinal = '';
    this.partidaGuardada = false;
    this.reiniciarTeclado();
    this.iniciarNuevaPalabra();
  }

  iniciarNuevaPalabra() {
    if (this.juegoTerminado && !this.partidaGuardada && this.errores >= this.maxErrores) {
      this.guardarPartida('perdida');
      return;
    }

    this.errores = 0;
    this.letrasErradas = [];
    this.imagenMonigote = 'assets/illustrations/monigote-1.png';

    const randomIndex = Math.floor(Math.random() * this.palabras.length);
    this.palabraSeleccionada = this.palabras[randomIndex].toUpperCase();
    this.palabraMostrada = Array(this.palabraSeleccionada.length).fill('_');

    console.log(`Palabra a adivinar: ${this.palabraSeleccionada}`);
  }

  elegirLetra(letra: string, boton: HTMLButtonElement) {
    if (this.juegoTerminado) return;

    boton.disabled = true;

    const palabraNormalizada = this.normalizeLetter(this.palabraSeleccionada);
    const letraNormalizada = this.normalizeLetter(letra);

    if (palabraNormalizada.includes(letraNormalizada)) {
      this.revelarLetra(letraNormalizada);
      this.verificarVictoria();
    } else {
      this.errores++;
      this.letrasErradas.push(letra);
      this.actualizarMonigote();
      this.verificarDerrota();
    }
  }

  revelarLetra(letraNormalizada: string) {
    for (let i = 0; i < this.palabraSeleccionada.length; i++) {
      const letraPalabra = this.palabraSeleccionada[i];
      const letraPalabraNormalizada = this.normalizeLetter(letraPalabra);

      if (letraPalabraNormalizada === letraNormalizada) {
        this.palabraMostrada[i] = letraPalabra;
      }
    }
  }

  verificarVictoria() {
    if (!this.palabraMostrada.includes('_')) {
      this.palabrasAdivinadas++;
      this.puntuacionTotal += 10;
      
      this.mensajeFinal = `✅ ¡Correcto! +10 puntos. Total: ${this.puntuacionTotal}`;
      
      setTimeout(() => {
        this.mensajeFinal = '';
        this.reiniciarTeclado();
        this.iniciarNuevaPalabra();
      }, 1500);
    }
  }

  verificarDerrota() {
    if (this.errores >= this.maxErrores) {
      this.juegoTerminado = true;
      this.mensajeFinal = `💀 ¡Game Over! La palabra era "${this.palabraSeleccionada}". Puntuación final: ${this.puntuacionTotal}`;
      this.imagenMonigote = 'assets/illustrations/monigote-7.png';
      this.guardarPartida('perdida');
    }
  }

  reiniciarTeclado() {
    setTimeout(() => {
      if (this.botonesTeclado) {
        this.botonesTeclado.forEach(boton => {
          boton.nativeElement.disabled = false;
          boton.nativeElement.classList.remove('used', 'selected', 'correct', 'incorrect');
        });
      }
    });
  }

  normalizeLetter(letra: string): string {
    return letra.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  actualizarMonigote() {
    const numero = Math.min(this.errores + 1, 7);
    this.imagenMonigote = `assets/illustrations/monigote-${numero}.png`;
  }

  async guardarPartida(estado: 'perdida' | 'abandonada') {
    if (!this.userData?.id) {
      console.error('No hay usuario logueado');
      return;
    }

    if (this.partidaGuardada) {
      return;
    }

    const partidaData = {
      id_juego: 1,
      id_usuario: this.userData.id,
      puntaje: this.puntuacionTotal,
      completado_en: new Date().toISOString()
    };

    try {
      const { data, error } = await this.supabaseService.supabase
        .from('partidas')
        .insert([partidaData])
        .select();

      if (error) {
        throw error;
      }

      this.partidaGuardada = true;
      console.log(`Partida ${estado} guardada. Puntuación: ${this.puntuacionTotal}`, data);
      
    } catch (error) {
      console.error(`Error guardando partida ${estado}:`, error);
    }
  }
}