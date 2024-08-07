import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DominoDTO } from '../models/dominioDTO';
import { Domino } from '../models/domino';

@Injectable({
  providedIn: 'root'
})
export class DominoService {

  originalSet: Array<DominoDTO> = [];
  set: Array<Domino> = [];

  constructor(private httpClient: HttpClient) { }

  init(): void {
    this.loadDominoes().subscribe(response => {
      this.originalSet = response.set;
    });
  }

  loadDominoes(): Observable<any> {
    const url = '/assets/dominoes.json';
    return this.httpClient.get(url);
  }

  createDominoes(): void {
    const dominoes: Array<Domino> = [];
    for(let i = 0; i < this.originalSet.length; i++) {
      const domino: Domino = new Domino(this.originalSet[i]);
      dominoes.push(domino);
    }
    this.set = dominoes;
  }

  findHighDomino(dominoes: Array<Domino>): Domino {
    let high: Domino = dominoes[0];
    for(let i = 0; i < dominoes.length; i++) {
      const domino = dominoes[i];
      if (domino.isDouble) {
        high = domino;
        return high;
      }
      if (domino.total > high.total) {
        high = domino;
      }
    }
    return high;
  }

  findLowDomino(dominoes: Array<Domino>): Domino {
    let low: Domino = dominoes[0];
    for(let i = 1; i < dominoes.length; i++) {
      const domino = dominoes[i];
      if (domino.total < low.total && !domino.isDouble) {
        low = domino;
      }
    }
    return low;
  }

  findTrumps(dominoes: Array<Domino>, trump: number): Array<Domino> {
    let trumps = [];
    for(let i = 0; i < dominoes.length; i++) {
      const domino = dominoes[i];
      if (domino.primary === trump || domino.secondary === trump) {
        trumps.push(domino);
      }
    }
    return trumps;
  }

  findDoubles(dominoes: Array<Domino>): Array<Domino> {
    let doubles = [];
    for(let i = 0; i < dominoes.length; i++) {
      const domino = dominoes[i];
      if (domino.isDouble) {
        doubles.push(domino);
      }
    }
    return doubles;
  }  
}
