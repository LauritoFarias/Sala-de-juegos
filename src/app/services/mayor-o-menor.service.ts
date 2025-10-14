import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export interface Partida {
  id?: number;
  id_juego: number;
  id_usuario: number;
  puntaje: number;
  completado_en: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MayorOMenorService {
  private supabase: SupabaseClient;
  public idJuegoMayorOMenor = 2;

  constructor() {
    this.supabase = createClient(environment.apiUrl, environment.publicAnonKey);
  }

  async saveGame(partidaData: Omit<Partida, 'id' | 'created_at'>): Promise<any> {
    const { data, error } = await this.supabase
      .from('partidas')
      .insert([partidaData])
      .select();

    if (error) {
      console.error('Error saving game:', error);
      throw error;
    }

    return data;
  }

  async getUserGames(userId: number): Promise<Partida[]> {
    const { data, error } = await this.supabase
      .from('partidas')
      .select(`
        *,
        juegos:id_juego (juego, descripcion)
      `)
      .eq('id_usuario', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user games:', error);
      throw error;
    }

    return data || [];
  }
}