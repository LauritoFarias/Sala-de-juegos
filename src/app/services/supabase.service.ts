import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export interface Partida {
  id?: number;
  id_juego: number;
  id_usuario: number;
  puntaje: number;
  completado_en: string;
}

export interface Encuesta {
  id?: number;
  nombre_apellido: string;
  edad: number;
  telefono: string;
  calificacion_juegos: string;
  servicios_adicionales: string[];
  frecuencia_visita: string;
  juego_favorito: string;
  email_referido: string;
  creado_en?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  public supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.apiUrl, environment.publicAnonKey);
  }

  async guardarPartida(partida: Omit<Partida, 'id'>): Promise<any> {
    const { data, error } = await this.supabase
      .from('partidas')
      .insert([partida])
      .select();

    if (error) {
      console.error('Error al guardar partida:', error);
      throw error;
    }

    return data;
  }

  async obtenerPartidasUsuario(idUsuario: number): Promise<Partida[]> {
    const { data, error } = await this.supabase
      .from('partidas')
      .select('*')
      .eq('id_usuario', idUsuario)
      .order('completado_en', { ascending: false });

    if (error) {
      console.error('Error al obtener partidas:', error);
      throw error;
    }

    return data || [];
  }

  async insertGame(gameData: any): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('partidas')
        .insert([
          {
            id_juego: gameData.id_juego,
            id_usuario: gameData.id_usuario,
            puntaje: gameData.puntaje,
            completado_en: gameData.completado_en
          }
        ])
        .select();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error inserting game:', error);
      return { data: null, error };
    }
  }

  async obtenerJuegos() {
    const { data, error } = await this.supabase
      .from('juegos')
      .select('*')
      .order('id', { ascending: true });
    if (error) throw error;
    return data;
  }

  async obtenerPartidasPorJuego(idJuego: number) {
    const { data, error } = await this.supabase
      .from('partidas')
      .select(`
        id,
        puntaje,
        completado_en,
        users (
          nombre,
          edad
        )
      `)
      .eq('id_juego', idJuego)
      .order('completado_en', { ascending: false });

    if (error) throw error;
    return data;
  }

  async guardarEncuesta(encuesta: Omit<Encuesta, 'id' | 'creado_en'>): Promise<{ data: any | null, error: any }> {
    const { data, error } = await this.supabase
      .from('encuestas')
      .insert([encuesta])
      .select();

    if (error) {
      console.error('Error al guardar encuesta:', error);
      return { data: null, error };
    }

    return { data, error: null };
  }

  async obtenerTodasLasEncuestas(): Promise<{ data: Encuesta[] | null, error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('encuestas')
        .select('*')
        .order('creado_en', { ascending: false });

      if (error) {
        console.error('Error al obtener encuestas:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error en obtenerTodasLasEncuestas:', error);
      return { data: null, error };
    }
  }
}