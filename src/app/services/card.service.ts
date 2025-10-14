import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Card {
  code: string;
  image: string;
  value: string;
  suit: string;
  numericValue: number;
}

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private baseUrl = 'https://deckofcardsapi.com/api/deck';

  constructor(private http: HttpClient) {}

  createNewDeck(): Observable<string> {
    return this.http.get<any>(`${this.baseUrl}/new/shuffle/?deck_count=1`)
      .pipe(map(response => response.deck_id));
  }

  drawCard(deckId: string): Observable<Card> {
    return this.http.get<any>(`${this.baseUrl}/${deckId}/draw/?count=1`)
      .pipe(
        map(response => {
          const card = response.cards[0];
          return {
            ...card,
            numericValue: this.getNumericValue(card.value)
          };
        })
      );
  }

  private getNumericValue(value: string): number {
    const values: {[key: string]: number} = {
      'ACE': 1,
      '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
      'JACK': 11, 'QUEEN': 12, 'KING': 13
    };
    return values[value] || 0;
  }
}