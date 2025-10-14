import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-resultados',
  imports: [CommonModule],
  templateUrl: './resultados.html',
  styleUrl: './resultados.scss'
})
export class Resultados implements OnInit{

  juegos: any[] = [];
  partidas: any[] = [];
  juegoSeleccionado: number | null = null;
  nombreJuegoSeleccionado: string = '';
  descripcionJuegoSeleccionado: string = '';
  cargando = false;

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    this.juegos = await this.supabaseService.obtenerJuegos();
    if (this.juegos.length > 0) {
      this.seleccionarJuego(this.juegos[0].id);
    }
  }

  async seleccionarJuego(idJuego: number) {
    this.cargando = true;
    this.juegoSeleccionado = idJuego;

    const juego = this.juegos.find(j => j.id === idJuego);
    this.nombreJuegoSeleccionado = juego ? juego.juego : '';
    this.descripcionJuegoSeleccionado = juego ? juego.descripcion : '';

    this.partidas = await this.supabaseService.obtenerPartidasPorJuego(idJuego);
    this.cargando = false;
  }
}
