import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SupabaseService, Encuesta } from '../../services/supabase.service';

@Component({
  selector: 'app-respuestas-encuesta',
  imports: [CommonModule],
  templateUrl: './respuestas-encuesta.html',
  styleUrl: './respuestas-encuesta.scss'
})
export class RespuestasEncuesta {
  encuestas: Encuesta[] = [];
  cargando: boolean = true;
  error: boolean = false;

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    await this.cargarEncuestas();
  }

  async cargarEncuestas() {
    try {
      this.cargando = true;
      this.error = false;
      
      const resultado = await this.supabaseService.obtenerTodasLasEncuestas();
      
      if (resultado.error) {
        throw resultado.error;
      }

      this.encuestas = resultado.data || [];
    } catch (error) {
      console.error('Error al cargar encuestas:', error);
      this.error = true;
    } finally {
      this.cargando = false;
    }
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
