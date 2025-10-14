import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface Character {
  id: number;
  name: string;
  image: string;
}

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: any[];
}

@Injectable({
  providedIn: 'root'
})
export class SimpsonsService {
  private baseUrl = 'https://thesimpsonsapi.com/api/characters';
  private imageBaseUrl = 'https://cdn.thesimpsonsapi.com/500/character';
  
  constructor(private http: HttpClient) { }

  getCharacters(): Observable<Character[]> {
    const page1$ = this.http.get<ApiResponse>(`${this.baseUrl}?page=1`);
    const page2$ = this.http.get<ApiResponse>(`${this.baseUrl}?page=2`);
    const page3$ = this.http.get<ApiResponse>(`${this.baseUrl}?page=3`);

    return forkJoin([page1$, page2$, page3$]).pipe(
      map(([page1, page2, page3]) => {
        console.log('Páginas cargadas:', page1, page2, page3);
        
        const allResults = [
          ...(page1.results || []),
          ...(page2.results || []),
          ...(page3.results || [])
        ];

        if (allResults.length === 0) {
          throw new Error('No se pudieron cargar personajes');
        }

        const characters = allResults.slice(0, 60).map((character) => {
          return {
            id: character.id,
            name: character.name,
            image: `${this.imageBaseUrl}/${character.id}.webp`
          };
        });

        console.log(`Total de personajes cargados: ${characters.length}`);
        return characters;
      }),
      catchError(error => {
        console.error('Error en la API:', error);
        throw new Error('No se pudieron cargar los personajes desde la API');
      })
    );
  }
}